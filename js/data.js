// Seed data for the site. Publications are listed newest first.
//
// Fields per research entry:
//   id, shortName (optional), title, authors (comma separated), venue, venueShort, type ("Journal" | "Conference"),
//   year, date (YYYY-MM), volume/issue/pages (optional), doi, doiUrl, pdf, cover,
//   category (one of the filter keys below), tags, abstract, highlights,
//   metrics:  [{ value, label }]  — up to 3 headline numbers shown on cards/detail page
//   figures:  [{ src, caption }]
//   results:  optional chart data for the detail page

const RESEARCH_CATEGORIES = [
  { key: "segmentation", label: "Instance Segmentation" },
  { key: "detection",    label: "Object Detection" },
  { key: "xai",          label: "Explainable AI" }
];

const DEFAULT_RESEARCHES = [
  {
    id: "bactsegnet-2026",
    shortName: "BactSegNet",
    title: "BactSegNet: A Growth-Stage-Aware, Searched Instance-Segmentation Model for Salmonella and Escherichia coli Microcolonies in Pure-Culture Bright-Field Microscopy with a Food-Matrix Surrogate",
    authors: "Malek Rababa, Namariq Dhahir, Anas AlSobeh, Amer AbuGhazaleh, Khaled R. Ahmed",
    venue: "Journal of Imaging (MDPI)",
    venueShort: "J. Imaging",
    type: "Journal",
    year: "2026",
    date: "2026-10",
    volume: "12", issue: "11", pages: "525",
    doi: "10.3390/jimaging12110525",
    doiUrl: "https://doi.org/10.3390/jimaging12110525",
    pdf: "assets/papers/BactSegNet.pdf",
    cover: "assets/figures/research5/architecture.jpg",
    category: "segmentation",
    tags: ["Instance Segmentation", "Neural Architecture Search", "EfficientNetV2", "BiFPN", "FiLM Conditioning", "Food Safety"],
    metrics: [
      { value: "0.9636", label: "mask mAP@50" },
      { value: "+3.56 pp", label: "over YOLOv8" },
      { value: "14,318", label: "expert polygons" }
    ],
    abstract: "Instance segmentation of small, dense, low-contrast microcolonies against confounding food matrices limits early microscopy-based screening for Salmonella and E. coli. We present BactSegNet, combining EfficientNetV2, BiFPN, selective-kernel attention, and growth-stage FiLM conditioning based on a learnable embedding of recorded acquisition stage. BE-NAS explored a 2304-configuration search space and evaluated 71 unique architectures. Across twelve retrained candidates, proxy and full-training rankings agreed (Spearman ρ=0.867 for mAP@50 and ρ=0.790 for mAP@50–95). Across the 71 architectures evaluated in the BE-NAS proxy search, three-seed proxy fitness showed high reliability (ICC(1,1)=0.91; 213 seed-level evaluations), while phenotype caching reduced 180 scheduled evaluations to 71 unique trainings (213 rather than 540 seed-level proxy runs). On 14,318 expert-verified polygon instances spanning six stages, two species, and onion-present/absent conditions, BactSegNet-L achieved mask mAP@50 = 0.9636 and mAP@50–95 = 0.7154, 3.56 percentage points above a multi-seed YOLOv8 baseline and higher mAP@50 than sixteen class-aware single-run references across three paradigms. A capacity-preserving stage-perturbation control reduced mAP@50 from 0.9636±0.0049 with correct stage assignments to 0.9487±0.0040 after shuffling image–stage correspondence across three seeds. Gains reached 8.66 pp for Salmonella at 1.5 h and 4.90 pp on onion. Across 2756 matched instances, area MAPE was 12.15% with r=0.997, dominated by the largest instances. BactSegNet-Efficient retained 0.9510 mAP@50 with 19.1% fewer FLOPs at 43.9 fps. The main dataset comprises pure-culture frames; an independent, expert-annotated mixed-culture evaluation (400 images, 3.5 and 4.0 h) yielded mask mAP@50=0.8857±0.0206 across three seeds without retraining. Recorded growth-stage metadata are required at inference, unlike the image-only comparison models. These results support early, physically calibrated microcolony segmentation while distinguishing the original pure-culture evaluation from the additional mixed-culture test.",
    highlights: [
      "BactSegNet-L: mask mAP@50 = 0.9636 and mAP@50–95 = 0.7154 — 3.56 pp above a multi-seed YOLOv8 baseline",
      "BE-NAS searched a 2,304-configuration space and evaluated 71 unique architectures (proxy fitness ICC = 0.91)",
      "Growth-stage FiLM conditioning: gains up to 8.66 pp for Salmonella at 1.5 h and 4.90 pp on onion backgrounds",
      "BactSegNet-Efficient keeps 0.9510 mAP@50 with 19.1% fewer FLOPs at 43.9 fps",
      "Mixed-culture test (400 images) without retraining: mask mAP@50 = 0.8857"
    ],
    results: {
      title: "Instance segmentation on the held-out test set",
      note: "Table 4 of the paper (mask metrics, 478 test images). BactSegNet and the YOLOv8s baseline are 3-seed means; other rows are single runs. Cellpose-SAM is omitted because it is class-agnostic.",
      metrics: ["mAP@50", "mAP@50–95", "Precision", "Recall"],
      defaultMetric: 0,
      rows: [
        { name: "BactSegNet-L",          values: [0.9636, 0.7154, 0.9487, 0.9397] },
        { name: "BactSegNet-M",          values: [0.9530, 0.7041, 0.9490, 0.9360] },
        { name: "BactSegNet-S",          values: [0.9466, 0.6989, 0.9402, 0.9314] },
        { name: "YOLOv8s-seg (baseline)", values: [0.9280, 0.6711, 0.9025, 0.9068], baseline: true },
        { name: "YOLOv8m-seg",           values: [0.9391, 0.6898, 0.9185, 0.9158] },
        { name: "YOLOv8l-seg",           values: [0.9402, 0.6791, 0.9169, 0.9194] },
        { name: "YOLOv9c-seg",           values: [0.9357, 0.6851, 0.9153, 0.9221] },
        { name: "YOLOv9e-seg",           values: [0.9411, 0.6858, 0.9191, 0.9241] },
        { name: "YOLO11s-seg",           values: [0.9373, 0.6710, 0.9247, 0.9196] },
        { name: "YOLO11m-seg",           values: [0.9357, 0.6765, 0.9095, 0.9136] },
        { name: "YOLO11l-seg",           values: [0.9357, 0.6820, 0.9250, 0.9215] },
        { name: "YOLO26s-seg",           values: [0.9400, 0.6835, 0.9161, 0.9066] },
        { name: "YOLO26m-seg",           values: [0.9412, 0.6985, 0.9245, 0.9029] },
        { name: "YOLO26l-seg",           values: [0.9310, 0.6840, 0.9001, 0.8966] },
        { name: "YOLOE-26s-seg",         values: [0.9397, 0.6749, 0.9242, 0.9155] },
        { name: "YOLOE-26m-seg",         values: [0.9399, 0.6816, 0.9156, 0.9145] },
        { name: "YOLOE-26l-seg",         values: [0.9349, 0.6813, 0.9287, 0.9106] },
        { name: "Mask R-CNN R50-FPN",    values: [0.9163, 0.6806, 0.9120, 0.9170] },
        { name: "Mask R-CNN R101-FPN",   values: [0.9210, 0.6850, 0.9170, 0.9200] },
        { name: "RF-DETR-Seg-L",         values: [0.9368, 0.7006, 0.9223, 0.9336] }
      ]
    },
    figures: [
      { src: "assets/figures/research5/architecture.jpg",
        caption: "Overview of the BactSegNet architecture: an EfficientNetV2-L backbone, a two-repeat BiFPN neck with SK-FPA and growth-stage-aware (GSAA, FiLM) conditioning from recorded stage metadata, and a YOLOv8 segmentation head." },
      { src: "assets/figures/research5/predictions.jpg",
        caption: "Correct BactSegNet predictions on test images ordered by growth time from 1.5 to 4.0 h: Salmonella (top, teal masks) and E. coli (bottom, blue masks), each labelled with its prediction confidence." },
      { src: "assets/figures/research5/dataset-samples.jpg",
        caption: "Representative dataset frames with ground-truth instance-segmentation overlays for Salmonella (top) and E. coli (bottom) at 1.5, 2.5 and 3.5 h, spanning the range of object scale." },
      { src: "assets/figures/research5/annotation-protocol.jpg",
        caption: "Annotation protocol: each object (a) is delineated by a closed polygon (b), an axis-aligned bounding box is derived from it (c), and each instance receives a class label, Salmonella or E. coli (d)." },
      { src: "assets/figures/research5/instance-distribution.jpg",
        caption: "Distribution of the 14,318 expert-verified instances over growth stage, species and background condition — most numerous at the early stages, where microcolonies are small and dense." },
      { src: "assets/figures/research5/modules.jpg",
        caption: "Internal modules of BactSegNet: (a) BiFPN with repeated top-down and bottom-up fusion; (b) SK-FPA combining dilation-1 and dilation-2 branches with selective-kernel weighting; and the growth-stage FiLM conditioning." },
      { src: "assets/figures/research5/be-nas-workflow.jpg",
        caption: "BE-NAS architecture-search workflow: a seven-gene chromosome encodes 2,304 candidate configurations, each scored by a three-seed proxy training run with a phenotype-hash cache reusing stored fitness." },
      { src: "assets/figures/research5/ablation.jpg",
        caption: "Per-class effect of removing each component from BactSegNet-L (mask AP@50). BiFPN helps both organisms equally; removing SK-FPA and especially GSAA costs Salmonella substantially more." },
      { src: "assets/figures/research5/map-vs-params.jpg",
        caption: "Mask mAP@50 against parameter count (log scale) for every class-aware model evaluated: reference models form a shallow band where a 6× range in capacity spans under 2.5 pp of accuracy." },
      { src: "assets/figures/research5/per-stage.jpg",
        caption: "Per-growth-stage mAP@50 for BactSegNet-L and the YOLOv8s baseline (three-seed means). The advantage is largest at the early and intermediate stages (1.5–2.5 h)." },
      { src: "assets/figures/research5/area-agreement.jpg",
        caption: "Predicted versus ground-truth microcolony area (μm²) for 2,756 matched test instances, computed from predicted masks using the physical calibration (r = 0.997)." },
      { src: "assets/figures/research5/failure-modes.jpg",
        caption: "Representative failure modes on the test split: false negatives (missed microcolonies), false positives (background structures segmented as colonies) and misclassifications." }
    ]
  },
  {
    id: "jfp-salmonella-phase-contrast-2026",
    title: "Rapid Detection of Salmonella Typhimurium Microcolonies Using Phase-Contrast Imaging and Deep Learning",
    authors: "Namariq Dhahir, Malek Rababa, Bibek Koirala, Amer AbuGhazaleh, Anas AlSobeh",
    venue: "Journal of Food Protection (Elsevier)",
    venueShort: "J. Food Prot.",
    type: "Journal",
    year: "2026",
    date: "2026-11",
    volume: "89", issue: "11", pages: "100934",
    doi: "10.1016/j.jfp.2026.100934",
    doiUrl: "https://doi.org/10.1016/j.jfp.2026.100934",
    pdf: "assets/papers/JFP%20paper.pdf",
    cover: "assets/figures/research4/yolov8x-detections.jpg",
    category: "detection",
    tags: ["YOLOv8", "Phase-Contrast Microscopy", "Salmonella", "Food Safety", "Microcolony Detection"],
    metrics: [
      { value: "2 h", label: "earliest reliable detection" },
      { value: "0.898", label: "mAP@0.50" },
      { value: "5,000", label: "microscopy images" }
    ],
    abstract: "Early detection of foodborne pathogens is critical for improving food safety and preventing contamination-related outbreaks. Conventional methods for detecting Salmonella spp. are reliable but require extended incubation times and labor-intensive procedures, limiting their use for rapid screening. In this study, we developed a rapid and automated detection framework that integrates phase-contrast microscopy with a YOLOv8x-based deep learning model to identify Salmonella enterica serovar Typhimurium at the microcolony stage. A dataset of 5,000 microscopy images, including pure and mixed cultures with Escherichia coli K-12 under both clean and food-matrix (onion) conditions, was collected across multiple time points (30 min to 4 h). The model achieved a precision of 0.891, recall of 0.867, and mAP@0.50 of 0.898. Reliable detection was achieved as early as 2 h of incubation, significantly reducing the time required compared to conventional culture-based methods. The model also demonstrated robust performance in mixed cultures, effectively distinguishing between morphologically similar bacterial species. In addition, instance-level analysis enabled quantitative characterization of microcolony growth dynamics over time. This approach provides a rapid, accurate, and cost-effective strategy for early-stage pathogen detection and has strong potential for real-time food safety monitoring and microbial diagnostics.",
    highlights: [
      "Reliable Salmonella detection as early as 2 h of incubation",
      "YOLOv8x: precision 0.891, recall 0.867, mAP@0.50 0.898",
      "5,000 phase-contrast images from 30 min to 4 h, pure and mixed cultures with E. coli K-12",
      "Robust under clean and onion food-matrix conditions",
      "Instance-level analysis quantifies microcolony growth dynamics over time"
    ],
    figures: [
      { src: "assets/figures/research4/yolov8x-detections.jpg",
        caption: "Microcolony detection using the YOLOv8x model: (A) detection results for S. Typhimurium; (B) detection results for E. coli K-12." },
      { src: "assets/figures/research4/growth-0-4h.jpg",
        caption: "Sequential phase-contrast images showing the growth progression of S. Typhimurium from 0 min to 4 h of incubation." },
      { src: "assets/figures/research4/growth-dynamics.jpg",
        caption: "Early microcolony growth dynamics of S. Typhimurium during incubation. Error bars indicate the standard deviation." },
      { src: "assets/figures/research4/polygon-annotation.jpg",
        caption: "Polygon-based annotation of microcolonies." },
      { src: "assets/figures/research4/ecoli-k12-timepoints.jpg",
        caption: "Representative images of E. coli K-12 microcolonies at (A) 2 h, (B) 3 h and (C) 4 h of incubation." },
      { src: "assets/figures/research4/confusion-matrix.jpg",
        caption: "Confusion matrix for microcolony detection and identification by the YOLOv8x model, pooled across imaging time points (2–4 h)." },
      { src: "assets/figures/research4/mixed-culture.jpg",
        caption: "Microcolony detection results for S. Typhimurium and E. coli K-12 in mixed culture." },
      { src: "assets/figures/research4/masks-early.jpg",
        caption: "Phase-contrast images and corresponding instance-segmentation masks of S. Typhimurium microcolonies at early time points (2–2.5 h) under different treatment conditions." },
      { src: "assets/figures/research4/masks-late.jpg",
        caption: "Phase-contrast images and instance-segmentation masks of S. Typhimurium microcolonies at later time points (3–4 h), showing increased colony size and cell number." }
    ]
  },
  {
    id: "yolov8-backbone-fusion-2026",
    shortName: "YOLOv8 backbones & necks",
    title: "Backbone and Feature Fusion Design for YOLOv8-Based Bacterial Microcolony Detection in Microscopy Images",
    authors: "Malek Rababa, Anas AlSobeh, Namariq Dhahir, Amer AbuGhazaleh",
    venue: "Applied Sciences (MDPI)",
    venueShort: "Appl. Sci.",
    type: "Journal",
    year: "2026",
    date: "2026-04",
    volume: "16", issue: "9", pages: "4241",
    doi: "10.3390/app16094241",
    doiUrl: "https://doi.org/10.3390/app16094241",
    pdf: "assets/papers/applsci-16-04241.pdf",
    cover: "assets/figures/research3/ecoli-detections.jpg",
    category: "detection",
    tags: ["YOLOv8", "EfficientNetV2", "NAS-FPN", "Object Detection", "Microscopy"],
    metrics: [
      { value: "0.987", label: "mAP@50" },
      { value: "0.976", label: "precision" },
      { value: "0.968", label: "recall" }
    ],
    abstract: "Foodborne bacterial contamination creates significant public health and economic challenges. In the United States, the CDC estimates that foodborne illness causes approximately 48 million illnesses and 3000 deaths annually. Rapid screening is important because conventional confirmation methods are time- and labor-intensive. Microscopy-based analysis of early bacterial microcolonies can enable detection within hours rather than days, yet manual inspection is slow, subjective, and impractical at scale. Although deep learning object detectors such as YOLO offer a promising solution, the impact of architectural design choices on microscopy-based bacterial detection has not been systematically characterized under controlled conditions. In this work, we conducted a controlled architectural evaluation of YOLOv8 for detecting bacterial microcolonies in high-resolution microscopy images. We replaced the CSP-Darknet backbone with EfficientNetV2 variants and evaluated three feature fusion designs: no neck, the original PAN-FPN neck, and a NAS-FPN-inspired neck. All experiments were performed under identical conditions on a two-class dataset of Salmonella and E. coli. Our results show that EfficientNetV2 architectures consistently outperform the YOLOv8x baseline, which achieved 0.891 precision, 0.867 recall, and 0.898 mAP@50. The best overall performance was obtained with EfficientNetV2-S and the original YOLOv8 neck, reaching 0.976 precision, 0.968 recall, and 0.987 mAP@50, with comparable performance of 0.986 mAP@50 achieved by EfficientNetV2-S + NAS-FPN. The highest precision was obtained with EfficientNetV2-L + NAS-FPN, reaching 0.978. These findings demonstrate that effective bacterial detection depends on the interaction between backbone capacity and feature fusion design rather than backbone scaling alone.",
    highlights: [
      "EfficientNetV2-S + YOLOv8 neck: 0.976 precision, 0.968 recall, 0.987 mAP@50",
      "Every EfficientNetV2 variant beats the YOLOv8x baseline (0.898 mAP@50)",
      "Highest precision (0.978) and mAP@50–95 (0.888) with EfficientNetV2-L + NAS-FPN",
      "Removing the feature-fusion neck consistently lowers recall and mAP@50"
    ],
    results: {
      title: "Test-split performance by architecture",
      note: "Table 1 of the paper. The YOLOv8x baseline did not report mAP@50–95.",
      metrics: ["Precision", "Recall", "mAP@50", "mAP@50–95"],
      rows: [
        { name: "YOLOv8x baseline",          values: [0.891, 0.867, 0.898, null],  baseline: true },
        { name: "EffNetV2-S + YOLOv8 neck",  values: [0.976, 0.968, 0.987, 0.887] },
        { name: "EffNetV2-S (no neck)",      values: [0.897, 0.923, 0.966, 0.824] },
        { name: "EffNetV2-S + NAS-FPN",      values: [0.969, 0.962, 0.986, 0.884] },
        { name: "EffNetV2-M + YOLOv8 neck",  values: [0.971, 0.959, 0.983, 0.886] },
        { name: "EffNetV2-M (no neck)",      values: [0.928, 0.922, 0.971, 0.853] },
        { name: "EffNetV2-M + NAS-FPN",      values: [0.969, 0.962, 0.985, 0.885] },
        { name: "EffNetV2-L + YOLOv8 neck",  values: [0.973, 0.962, 0.984, 0.886] },
        { name: "EffNetV2-L (no neck)",      values: [0.938, 0.929, 0.973, 0.862] },
        { name: "EffNetV2-L + NAS-FPN",      values: [0.978, 0.951, 0.983, 0.888] },
        { name: "Faster R-CNN",              values: [0.9016, 0.9371, 0.9016, 0.7757] },
        { name: "RetinaNet (ResNet50-FPN)",  values: [0.968, 0.9214, 0.8513, 0.8239] }
      ]
    },
    figures: [
      { src: "assets/figures/research3/ecoli-detections.jpg",
        caption: "Qualitative detection results for E. coli across growth stages from 1.5 h (early microcolony) to 4.0 h (mature microcolony)." },
      { src: "assets/figures/research3/salmonella-detections.jpg",
        caption: "Qualitative detection results for Salmonella across growth stages from 1.5 h to 4.0 h." },
      { src: "assets/figures/research3/nasfpn-architecture.jpg",
        caption: "YOLOv8 architecture with an EfficientNetV2 backbone and a NAS-FPN-inspired feature fusion neck." },
      { src: "assets/figures/research3/polygon-annotation.jpg",
        caption: "Polygon-based annotations for fine-grained delineation of bacterial microcolonies, showing irregular colony boundaries." },
      { src: "assets/figures/research3/instance-distribution.jpg",
        caption: "Distribution of bacterial instances by species and onion background condition." },
      { src: "assets/figures/research3/training-effv2s.jpg",
        caption: "Training and validation metrics over epochs for EfficientNetV2-S with the PAN-FPN neck." },
      { src: "assets/figures/research3/confusion-matrices.jpg",
        caption: "Normalized confusion matrices: baseline YOLOv8x, EfficientNetV2-S with the original YOLOv8 neck, and EfficientNetV2-L with a NAS-FPN-inspired neck." },
      { src: "assets/figures/research3/salmonella-errors.jpg",
        caption: "Qualitative error analysis for Salmonella: (a) false negatives, (b) false positives, (c) misclassifications." }
    ]
  },
  {
    id: "background-aware-segmentation-2025",
    title: "Background-Aware Instance Segmentation for Early Detection of E. coli and Salmonella in Time-Stamped Microscopy Images",
    authors: "Bibek Koirala, Anas M. Alsobeh, Namariq Dhahir, Amer AbuGhazaleh",
    venue: "24th International Conference on Machine Learning and Applications (ICMLA)",
    venueShort: "ICMLA",
    type: "Conference",
    year: "2025",
    date: "2025-12",
    doi: "",
    doiUrl: "",
    pdf: "assets/papers/Background-Aware_Instance_Segmentation_for_Early_Detection_of_E._coli_and_Salmonella_in_Time-Stamped_Microscopy_Images.pdf",
    cover: "assets/figures/research2/inference-results.png",
    category: "segmentation",
    tags: ["Computer Vision", "ViT", "Mask R-CNN", "SAM", "DINO", "ResNet", "Bacterial Detection", "Deep Learning"],
    metrics: [
      { value: "0.95", label: "mAP@0.5 at 2 h" },
      { value: "0.91–0.98", label: "mIoU range" },
      { value: "2,200", label: "annotated images" }
    ],
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
  },
  {
    id: "xaipath-2025",
    title: "XAIPath: Temporal-Environmental Explainable AI Framework for Co-Contaminated Food Pathogen Detection in Microscopic Imaging",
    authors: "Anas AlSobeh, Amer AbuGhazaleh, Namariq Dhahir, Malek Rababa",
    venue: "54th International Conference on Parallel Processing Companion (ICPP Companion '25)",
    venueShort: "ICPP '25",
    type: "Conference",
    year: "2025",
    date: "2025-09",
    doi: "10.1145/3750720.3758080",
    doiUrl: "https://doi.org/10.1145/3750720.3758080",
    pdf: "assets/papers/3750720.3758080.pdf",
    cover: "assets/figures/research1/icppcompanion25-30-fig6.jpg",
    category: "xai",
    tags: ["Explainable AI", "Food Safety", "Microscopy", "Deep Learning", "Temporal Modeling"],
    metrics: [
      { value: "92.9%", label: "F1-score" },
      { value: "94.7%", label: "precision" },
      { value: "91.7%", label: "explanation alignment" }
    ],
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
  }
];

const DEFAULT_MEMBERS = [
  { id: "amer-abughazaleh", name: "Amer AbuGhazaleh", role: "Professor",
    affiliation: "School of Agricultural Sciences — SIUC", email: "aabugha@siu.edu",
    photo: "assets/members/Amer-web.jpg", linkedin: "", github: "" },
  { id: "anas-alsobeh", name: "Anas M. R. AlSobeh", role: "Assistant Professor",
    affiliation: "Applied AI — Information Systems & Technology (IS&T), Utah Valley University (UVU)",
    email: "anas.alsobeh@uvu.edu", photo: "assets/members/Anas-web.jpg", linkedin: "", github: "" },
  { id: "namariq-dhahir", name: "Namariq Dhahir", role: "Post Doc",
    affiliation: "School of Agricultural Sciences — SIUC", email: "namariq@siu.edu",
    photo: "", linkedin: "", github: "" },
  { id: "malek-rababa", name: "Malek Rababa", role: "PhD Candidate, Computer Science",
    affiliation: "School of Computing — SIUC", email: "malekabdelrahmansaleem.rababa@siu.edu",
    photo: "", linkedin: "", github: "" },
  { id: "bibek-koirala", name: "Bibek Koirala", role: "MS, Computer Science",
    affiliation: "School of Computing — SIUC", email: "bibek.koirala@siu.edu",
    photo: "assets/members/bibek-web.jpg",
    linkedin: "https://www.linkedin.com/in/bibek--koirala",
    github: "https://github.com/vbek",
    scholar: "https://scholar.google.com/citations?user=4oAhHukAAAAJ&hl=en",
    totalPapers: 3 }  // all-time count from Google Scholar (includes work outside this site)
];

// Surnames used to highlight team members in author lists.
const TEAM_SURNAMES = ["AbuGhazaleh", "AlSobeh", "Alsobeh", "Dhahir", "Rababa", "Koirala"];

const DEFAULT_GALLERY = [
  { src: "assets/figures/research5/predictions.jpg", caption: "BactSegNet instance masks for Salmonella and E. coli from 1.5 h to 4.0 h." },
  { src: "assets/figures/research4/growth-0-4h.jpg", caption: "A single S. Typhimurium microcolony growing from 0 min to 4 h (phase contrast)." },
  { src: "assets/figures/research3/ecoli-detections.jpg", caption: "YOLOv8 + EfficientNetV2 detections of E. coli from 1.5 h to 4.0 h." },
  { src: "assets/figures/research4/yolov8x-detections.jpg", caption: "YOLOv8x detections of S. Typhimurium (A) and E. coli K-12 (B)." },
  { src: "assets/figures/research5/architecture.jpg", caption: "BactSegNet: EfficientNetV2-L + BiFPN + growth-stage-aware conditioning." },
  { src: "assets/figures/research2/ecoli-samples.png", caption: "E. coli colonies across incubation time points (1.5 h – 4 h) with average area." },
  { src: "assets/figures/research3/polygon-annotation.jpg", caption: "Polygon annotations tracing irregular microcolony boundaries." },
  { src: "assets/figures/research2/salmonella-samples.png", caption: "Salmonella colonies across incubation time points (1.5 h – 4 h) with average area." },
  { src: "assets/figures/research2/inference-results.png", caption: "Segmentation inference results for sample of E. coli and Salmonella colonies." },
  { src: "assets/figures/research3/salmonella-detections.jpg", caption: "Salmonella detections across growth stages." },
  { src: "assets/figures/research1/icppcompanion25-30-fig6.jpg", caption: "SHAP-like attribution maps and Grad-CAM visualizations from the XAIPath framework." },
  { src: "assets/images/lab-session-web.jpg", caption: "Lab session" }
];

const DEFAULT_SITE = {
  title: "Bacterial Detection Research",
  tagline: "Explainable AI for early detection of foodborne pathogens",
  intro: "We build deep-learning and explainable-AI methods for rapid, interpretable detection of bacterial contamination in food supply chains — spotting E. coli and Salmonella microcolonies in hours instead of days."
};
