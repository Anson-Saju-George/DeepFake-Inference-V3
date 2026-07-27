import os

TRUE_VALUES = {"1", "true", "t", "yes", "y", "on"}

_USE_MODAL = os.getenv("INFERENCE_BACKEND_MODAL", "false").strip().lower() in TRUE_VALUES
_FALLBACK = os.getenv("FALLBACK_TO_LOCAL", "false").strip().lower() in TRUE_VALUES
_APP_NAME = os.getenv("MODAL_APP_NAME", "").strip() or "df-engine"
_FUNCTION_NAME = os.getenv("MODAL_FUNCTION_NAME", "").strip() or "classify"


def _load_modal():
    import modal

    return modal


def dispatch(job_id, media_bytes, model_key, domain, is_video):
    """Returns ('modal', call_id) or ('local', None)."""
    if _USE_MODAL:
        try:
            modal = _load_modal()
            fn = modal.Function.from_name(_APP_NAME, _FUNCTION_NAME)
            call = fn.spawn(job_id, media_bytes, model_key, domain, is_video)
            return ("modal", call.object_id)
        except Exception:
            if not _FALLBACK:
                raise

    return ("local", None)


def poll(call_id):
    """Returns ('running', None), ('done', result_dict), or ('failed', reason)."""
    modal = _load_modal()
    fc = modal.FunctionCall.from_id(call_id)
    try:
        return ("done", fc.get(timeout=0))
    except Exception as exc:
        if isinstance(exc, TimeoutError) or exc.__class__.__name__ == "TimeoutError":
            return ("running", None)
        return ("failed", str(exc))
