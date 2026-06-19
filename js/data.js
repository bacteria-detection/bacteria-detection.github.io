// Default seed data for the site. The dashboard writes user edits into
// localStorage which overrides these defaults at runtime.

const DEFAULT_RESEARCHES = [
  {
    id: "xaipath-2025",
    title: "XAIPath: Temporal-Environmental Explainable AI Framework for Co-Contaminated Food Pathogen Detection in Microscopic Imaging",
    authors: "Anas AlSobeh, Amer AbuGhazaleh, Namariq Dhahir, Malek Rababa",
    venue: "54th International Conference on Parallel Processing Companion (ICPP Companion '25)",
    year: "2025",
    doi: "10.1145/3750720.3758080",
    doiUrl: "https://doi.org/10.1145/3750720.3758080",
    pdf: "researches/research 1 3750720.3758080.pdf",
    cover: "assets/figures/research1/icppcompanion25-30-fig6.jpg",
    tags: ["Explainable AI", "Food Safety", "Microscopy", "Deep Learning", "Temporal Modeling"],
    abstract: "Food safety monitoring requires rapid and accurate detection of bacterial contamination, particularly in scenarios involving multiple pathogen species under varying environmental conditions. Traditional machine learning approaches for microscopic bacterial detection lack interpretability, limiting their adoption in critical food safety applications where decision transparency is paramount. This paper introduces XAIPath, a novel temporal-environmental explainable artificial intelligence (XAI) framework that addresses co-contamination detection while providing interpretable explanations for classification decisions. Our approach integrates temporal growth dynamics and environmental context through specialized encoding mechanisms that capture bacterial morphological evolution and biochemical stress responses. The framework employs a multi-modal explainability engine combining Grad-CAM, SHAP, and LIME techniques with temporal consistency constraints to generate biologically plausible explanations. Experimental evaluation on a proprietary dataset of 2,847 high-resolution microscopic images spanning eight temporal growth phases and two environmental conditions demonstrates superior performance, achieving 94.7% precision, 91.3% recall, and 92.9% F1-score. The explainability quality, measured through expert validation and localization accuracy metrics, shows 91.7% alignment with ground truth bacterial regions. Ablation studies confirm the synergistic contributions of temporal and environmental encoding, with combined removal resulting in 11.9% performance degradation. The framework advances XAI in food safety applications while establishing new benchmarks for interpretable bacterial detection systems.",
    highlights: [
      "94.7% precision, 91.3% recall, 92.9% F1-score on co-contamination detection",
      "91.7% alignment with ground truth bacterial regions on expert validation",
      "Dataset of 2,847 high-resolution microscopic images over 8 growth phases",
      "Multi-modal explainability combining Grad-CAM, SHAP, and LIME"
    ],
    figures: [
      { src: "assets/figures/research1/icppcompanion25-30-fig5.jpg",
        caption: "Performance versus growth time and environmental robustness comparing XAIPath against a baseline CNN across the two environmental conditions (without onion vs. with onion)." },
      { src: "assets/figures/research1/icppcompanion25-30-fig6.jpg",
        caption: "Explanation quality of the framework: (a) SHAP-like attribution maps highlighting pixel-wise importance, and (b) Grad-CAM visualizations from the model backbone, both anchored to biologically meaningful regions." },
      { src: "assets/figures/research1/icppcompanion25-30-fig7.jpg",
        caption: "Ablation study: detection performance and explanation quality across configurations (Full XAIPath, without Temporal, without Environmental, without Both), confirming the synergistic contributions of temporal and environmental encoding." }
    ]
  },
  {
    id: "background-aware-segmentation-2025",
    title: "Background-Aware Instance Segmentation for Early Detection of E. coli and Salmonella in Time-Stamped Microscopy Images",
    authors: "Bibek Koirala, Anas M. Alsobeh, Namariq Dhahir, Amer AbuGhazaleh",
    venue: "24th International Conference on Machine Learning and Applications (ICMLA)",
    year: "2025",
    doi: "",
    doiUrl: "",
    pdf: "researches/research 2 Background-Aware_Instance_Segmentation_for_Early_Detection_of_E._coli_and_Salmonella_in_Time-Stamped_Microscopy_Images.pdf",
    cover: "assets/figures/research2/inference-results.png",
    tags: ["Computer Vision", "ViT", "Mask R-CNN", "Cellpose", "Bacterial Detection", "Deep Learning"],
    abstract: "Rapid detection of bacterial contamination in food supply chains is essential to prevent outbreaks and protect public health. Traditional microbiological methods, such as culture and biochemical testing, are slow and can delay necessary interventions. This study presents deep learning–based approaches for the early detection and classification of Escherichia coli and Salmonella Typhimurium in microscopy images captured during incubation periods ranging from 1.5 hours to 4 hours, with a step size of 30 min, under two different conditions: a plain background and an onion mixture background. We annotated a dataset of 2,200 high-resolution (2160×1620) images, collected under 60× magnification from the time frame 1.5 h to 4 h, using a combination of manual and semi-automated techniques with Mask R-CNN. For manual annotation, dataset was annotated using tkinter framework in python. For model training, only pure culture data were used. The initial pipeline employed Cellpose for segmentation and a ViT for classification across bacterial growth stages. However, Cellpose was unable to segment all instances in an image due to its requirement for a diameter parameter, which, under variable colony sizes, resulted in partial segmentation. To overcome these challenges, we adopted an endto-end Mask R-CNN model for instance segmentation. Mask RCNN achieved consistently strong mean Intersection over Union (mIoU) scores between 0.91 and 0.98 across growth stages. Over the full incubation period, the mean Average Precision (AP) and Average Recall (AR) at IoU threshold 0.5 were 0.93 and 0.96 for E. coli, and 0.945 and 0.975 for Salmonella, respectively, indicating robust detection performance across bacterial types and bacterial growth period. Using fine-tuned Mask R-CNN trained on background aware time-stamped microscopy datasets, our method achieves an mAP@0.5 of 0.95 for colonies cultured at 2 hours timepoint. This work focuses on proactive food safety monitoring in agricultural pipelines.",
    highlights: [
      "mIoU between 0.91 and 0.98 across growth stages",
      "mAP@0.5 of 0.95 at the 2-hour timepoint",
      "AP/AR at IoU 0.5 — E. coli: 0.93/0.96; Salmonella: 0.945/0.975",
      "Over 2000 annotated images, 60× magnification, 1.5h–4h incubation"
    ],
    figures: [
      { src: "assets/figures/research2/ecoli-samples.png",
        caption: "Samples of E. coli colonies at different time frames (1.5 h–4 h) with average area in μm²." },
      { src: "assets/figures/research2/salmonella-samples.png",
        caption: "Samples of Salmonella colonies at different time frames (1.5 h–4 h) with average area in μm²." },
      { src: "assets/figures/research2/annotation-sample.png",
        caption: "Annotation samples for plain and onion-mixture backgrounds at 2 h and 2.5 h. Each pair shows the raw microscopy image alongside its instance-mask annotation." },
      { src: "assets/figures/research2/training-validation.png",
        caption: "mAP performance of Mask R-CNN across IoU thresholds (0.50 to 0.95) over 20 training epochs." },
      { src: "assets/figures/research2/inference-results.png",
        caption: "Instance segmentation results from Mask R-CNN for E. coli and Salmonella across various time points. For each image pair, the original is shown on the left and the predicted segmentation and classification on the right — red overlays indicate predicted masks, green boxes detected objects, and yellow labels predicted class with confidence." },
      { src: "assets/figures/research2/inference-mixed.png",
        caption: "Pairwise visualization of Mask R-CNN predictions on mixed bacterial colonies at different time points: original (left) and segmentation/classification result (right), with masks in red, bounding boxes in green, and class labels with confidence in yellow." },
      { src: "assets/figures/research2/metrics-table.png",
        caption: "Per-timepoint detection and segmentation metrics for E. coli and Salmonella — Precision, Recall, F1, support, and mean IoU." }
    ]
  }
];

const DEFAULT_MEMBERS = [
  { id: "amer-abughazaleh", name: "Amer AbuGhazaleh", role: "Professor",
    affiliation: "School of Agricultural Sciences — SIUC", email: "aabugha@siu.edu",
    photo: "assets/members/Amer.png", linkedin: "", github: "" },
  { id: "anas-alsobeh", name: "Anas M. R. AlSobeh", role: "Assistant Professor",
    affiliation: "Applied AI — Information Systems & Technology (IS&T), Utah Valley University (UVU)",
    email: "anas.alsobeh@uvu.edu", photo: "assets/members/anas.png", linkedin: "", github: "" },
  { id: "namariq-dhahir", name: "Namariq Dhahir", role: "Post Doc",
    affiliation: "School of Agricultural Sciences — SIUC", email: "namariq@siu.edu",
    photo: "", linkedin: "", github: "" },
  { id: "malek-rababa", name: "Malek Rababa", role: "PhD Candidate, Computer Science",
    affiliation: "School of Computing — SIUC", email: "malekabdelrahmansaleem.rababa@siu.edu",
    photo: "", linkedin: "", github: "" },
  { id: "bibek-koirala", name: "Bibek Koirala", role: "MS, Computer Science",
    affiliation: "School of Computing — SIUC", email: "bibek.koirala@siu.edu",
    photo: "assets/members/bibek.png",
    linkedin: "https://www.linkedin.com/in/bibek--koirala",
    github: "https://github.com/vbek" }
];

const DEFAULT_GALLERY = [
  { src: "assets/figures/research2/ecoli-samples.png", caption: "E. coli colonies across incubation time points (1.5 h – 4 h) with average area." },
  { src: "assets/figures/research2/salmonella-samples.png", caption: "Salmonella colonies across incubation time points (1.5 h – 4 h) with average area." },
  { src: "assets/figures/research2/inference-results.png", caption: "Segmentation inference results for sample of E. coli and Salmonella colonies." },
  { src: "assets/figures/research1/icppcompanion25-30-fig6.jpg", caption: "SHAP-like attribution maps and Grad-CAM visualizations from the XAIPath framework." },
  { src: "assets/figures/research2/training-validation.png", caption: "mAP across IoU thresholds over 20 training epochs." },
  { src: "assets/images/lab-session.jpg", caption: "Lab session" }
];

const DEFAULT_SITE = {
  title: "Bacterial Detection Research",
  tagline: "Explainable AI for early detection of foodborne pathogens",
  intro: "We build deep-learning and explainable-AI methods for rapid, interpretable detection of bacterial contamination in food supply chains. Our work focuses on time-stamped microscopy of E. coli and Salmonella, multi-pathogen co-contamination, and transparent decision-making for critical food-safety applications."
};
