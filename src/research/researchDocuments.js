import problemDefinition from "../../documents/01_problem_definition.md?raw";
import dataCollection from "../../documents/02_data_collection.md?raw";
import preprocessing from "../../documents/03_data_cleaning_preprocessing.md?raw";
import exploratoryAnalysis from "../../documents/04_exploratory_data_analysis.md?raw";
import featureEngineering from "../../documents/05_feature_engineering.md?raw";
import modelSelection from "../../documents/06_model_selection.md?raw";
import modelTraining from "../../documents/07_model_training.md?raw";
import modelEvaluation from "../../documents/08_model_evaluation.md?raw";
import hyperparameterTuning from "../../documents/09_hyperparameter_tuning.md?raw";
import deployment from "../../documents/10_deployment.md?raw";
import monitoring from "../../documents/11_monitoring_maintenance.md?raw";
import iteration from "../../documents/12_iteration_continuous_improvement.md?raw";
import commands from "../../documents/commands.md?raw";
import dataset from "../../documents/dataset.md?raw";
import experimentMatrix from "../../documents/experiment_matrix.md?raw";
import readme from "../../documents/README.md?raw";
import researchNotes from "../../documents/research_notes.md?raw";

export const RESEARCH_DOCUMENTS = [
  {
    group: "Research Lifecycle",
    docs: [
      { title: "Problem Definition", filename: "documents/01_problem_definition.md", content: problemDefinition },
      { title: "Data Collection", filename: "documents/02_data_collection.md", content: dataCollection },
      { title: "Data Cleaning and Preprocessing", filename: "documents/03_data_cleaning_preprocessing.md", content: preprocessing },
      { title: "Exploratory Data Analysis", filename: "documents/04_exploratory_data_analysis.md", content: exploratoryAnalysis },
      { title: "Feature Engineering", filename: "documents/05_feature_engineering.md", content: featureEngineering },
      { title: "Model Selection", filename: "documents/06_model_selection.md", content: modelSelection },
      { title: "Model Training", filename: "documents/07_model_training.md", content: modelTraining },
      { title: "Model Evaluation", filename: "documents/08_model_evaluation.md", content: modelEvaluation },
      { title: "Hyperparameter Tuning", filename: "documents/09_hyperparameter_tuning.md", content: hyperparameterTuning },
      { title: "Deployment", filename: "documents/10_deployment.md", content: deployment },
      { title: "Monitoring and Maintenance", filename: "documents/11_monitoring_maintenance.md", content: monitoring },
      { title: "Iteration and Continuous Improvement", filename: "documents/12_iteration_continuous_improvement.md", content: iteration },
    ],
  },
  {
    group: "Audit Reference",
    docs: [
      { title: "Research Knowledge Base", filename: "documents/README.md", content: readme },
      { title: "Research Notes", filename: "documents/research_notes.md", content: researchNotes },
      { title: "Experiment Matrix", filename: "documents/experiment_matrix.md", content: experimentMatrix },
      { title: "Dataset", filename: "documents/dataset.md", content: dataset },
      { title: "Commands", filename: "documents/commands.md", content: commands },
    ],
  },
];

export const FLAT_RESEARCH_DOCUMENTS = RESEARCH_DOCUMENTS.flatMap((section) => section.docs);
