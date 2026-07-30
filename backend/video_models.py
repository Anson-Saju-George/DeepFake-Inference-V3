"""Reconstructed temporal video-model architectures for deepfake detection.

Every video checkpoint is a timm backbone used as a per-frame feature extractor
(namespaced under `backbone.`) plus a temporal head + classifier. The architectures
were reverse-engineered from the checkpoint state_dict key names and shapes; the
module attribute names here (`backbone`, `temporal`, `head`) must match the checkpoint.

Families (from config "family"/"mode"):
  spatial      : single frame -> head Linear                          (VID-SPA)
  pool         : per-frame features -> mean over T -> head Linear      (Sequence / Hybrid)
  lstm         : per-frame features -> LSTM -> head Linear             (VID-TMP LSTM)
  tcn          : per-frame features -> Conv1d stack -> classifier      (TCN)
  transformer  : per-frame features -> TransformerEncoder -> head      (Transformer)
  convlstm     : per-frame spatial maps -> ConvLSTM cell -> classifier (ConvLSTM)
"""
import timm
import torch
import torch.nn as nn


def family_type(family: str, mode: str) -> str:
    f = (family or "").lower()
    if "convlstm" in f:
        return "convlstm"
    if "tcn" in f:
        return "tcn"
    if "transformer" in f:
        return "transformer"
    if "lstm" in f:
        return "lstm"
    if mode == "single":
        return "spatial"
    # "Sequence" / "Hybrid" with no explicit temporal head -> mean-pool.
    return "pool"


class TCNHead(nn.Module):
    def __init__(self, in_dim: int, hidden: int = 512):
        super().__init__()
        # blocks.0 = Conv1d(in,hidden,3); blocks.3 = Conv1d(hidden,hidden,3); 1,2,4,5 paramless.
        self.blocks = nn.Sequential(
            nn.Conv1d(in_dim, hidden, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Dropout(0.0),
            nn.Conv1d(hidden, hidden, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Dropout(0.0),
        )
        self.classifier = nn.Linear(hidden, 2)

    def forward(self, x):  # x: (B, T, D)
        x = x.transpose(1, 2)          # (B, D, T)
        x = self.blocks(x)             # (B, hidden, T)
        x = x.mean(dim=2)              # (B, hidden)
        return self.classifier(x)


class ConvLSTMCell(nn.Module):
    def __init__(self, in_ch: int, hidden_ch: int):
        super().__init__()
        self.hidden_ch = hidden_ch
        self.gates = nn.Conv2d(in_ch + hidden_ch, 4 * hidden_ch, kernel_size=3, padding=1)

    def forward(self, seq):  # seq: (B, T, C, H, W)
        b, t, c, h, w = seq.shape
        hx = seq.new_zeros(b, self.hidden_ch, h, w)
        cx = seq.new_zeros(b, self.hidden_ch, h, w)
        for i in range(t):
            combined = torch.cat([seq[:, i], hx], dim=1)
            i_, f_, o_, g_ = torch.chunk(self.gates(combined), 4, dim=1)
            i_, f_, o_ = torch.sigmoid(i_), torch.sigmoid(f_), torch.sigmoid(o_)
            g_ = torch.tanh(g_)
            cx = f_ * cx + i_ * g_
            hx = o_ * torch.tanh(cx)
        return hx  # (B, hidden, H, W)


class ConvLSTMHead(nn.Module):
    def __init__(self, in_ch: int, hidden_ch: int = 256):
        super().__init__()
        self.cell = ConvLSTMCell(in_ch, hidden_ch)
        # classifier.1 = Linear(hidden,2); index 0 paramless (global pool handled in forward).
        self.classifier = nn.Sequential(nn.Dropout(0.0), nn.Linear(hidden_ch, 2))

    def forward(self, seq):  # seq: (B, T, C, H, W)
        h = self.cell(seq)                # (B, hidden, H, W)
        h = h.mean(dim=(2, 3))            # global average pool -> (B, hidden)
        return self.classifier(h)


class VideoModel(nn.Module):
    def __init__(self, model_name: str, ftype: str, seq_len: int = 4):
        super().__init__()
        self.ftype = ftype
        self.seq_len = seq_len
        spatial = ftype == "convlstm"
        # For ConvLSTM we need spatial feature maps; others use pooled per-frame vectors.
        self.backbone = timm.create_model(
            model_name, pretrained=False, num_classes=0,
            global_pool="" if spatial else "avg",
        )
        d = self.backbone.num_features

        if ftype in ("spatial", "pool"):
            self.head = nn.Linear(d, 2)
        elif ftype == "lstm":
            self.temporal = nn.LSTM(d, 512, batch_first=True)
            self.head = nn.Sequential(nn.Dropout(0.0), nn.Linear(512, 2))  # head.1 = Linear
        elif ftype == "tcn":
            self.temporal = TCNHead(d)
        elif ftype == "transformer":
            layer = nn.TransformerEncoderLayer(
                d_model=d, nhead=8, dim_feedforward=2048, batch_first=True,
            )
            self.temporal = nn.TransformerEncoder(layer, num_layers=1)
            self.head = nn.Sequential(nn.LayerNorm(d), nn.Dropout(0.0), nn.Linear(d, 2))
        elif ftype == "convlstm":
            self.temporal = ConvLSTMHead(d)
        else:
            raise ValueError(f"Unknown family type: {ftype}")

    def _frame_feats(self, frames):  # frames: (B, T, C, H, W) -> (B, T, D)
        b, t = frames.shape[:2]
        flat = frames.flatten(0, 1)
        feats = self.backbone(flat)
        return feats.reshape(b, t, -1)

    def forward(self, frames):  # frames: (B, T, C, H, W)
        if self.ftype == "spatial":
            return self.head(self.backbone(frames[:, 0]))
        if self.ftype == "convlstm":
            b, t, c, h, w = frames.shape
            maps = self.backbone(frames.flatten(0, 1))      # (B*T, C, H', W')
            maps = maps.reshape(b, t, *maps.shape[1:])
            return self.temporal(maps)
        feats = self._frame_feats(frames)                    # (B, T, D)
        if self.ftype == "pool":
            return self.head(feats.mean(dim=1))
        if self.ftype == "lstm":
            out, _ = self.temporal(feats)
            return self.head(out[:, -1])
        if self.ftype == "tcn":
            return self.temporal(feats)
        if self.ftype == "transformer":
            enc = self.temporal(feats)
            return self.head(enc.mean(dim=1))
        raise ValueError(self.ftype)
