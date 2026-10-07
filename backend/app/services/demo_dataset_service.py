from typing import List, Dict, Any

DEMO_PAPERS = [
    {
        "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        "original_filename": "lewis2020_rag.pdf",
        "authors": ["Patrick Lewis", "Ethan Perez", "Aleksandra Piktus", "Fabio Petroni", "Vladimir Karpukhin"],
        "publication_year": 2020,
        "venue": "NeurIPS 2020",
        "abstract": "Large pre-trained language models store factual knowledge in their parameters, but their ability to access and precisely manipulate knowledge is limited. We propose Retrieval-Augmented Generation (RAG) models which combine pre-trained parametric and non-parametric memory for language generation.",
        "page_count": 12,
        "raw_text": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. ABSTRACT: Large pre-trained language models store factual knowledge in their parameters. We propose RAG architectures. 1. INTRODUCTION: Neural language models are prone to hallucinating non-existent facts when queried on specialized domain corpora. 2. METHODOLOGY: We combine dense passage retriever (DPR) with sequence-to-sequence generator (BART). 3. EXPERIMENTS: Benchmarked on Natural Questions and CuratedTREC. 4. RESULTS: Achieves 44.5% exact match on Natural Questions, outperforming standard generative baselines. 5. LIMITATIONS: Retrieval latency introduces substantial overhead during multi-step inference, and DPR frequently fails to capture fine-grained numeric constraints. 6. FUTURE WORK: End-to-end joint training of dense retrieval and verification mechanisms.",
        "analysis": {
            "research_problem": "Language models hallucinate and fail to maintain updated factual grounding without external non-parametric retrieval.",
            "research_objective": "To integrate parametric sequence models with dense non-parametric vector retrieval for grounded factual generation.",
            "methodology": "Combines a Dense Passage Retriever (DPR) bi-encoder with a BART sequence-to-sequence generator via marginalization over top-k retrieved documents.",
            "dataset": "Natural Questions (NQ), WebQuestions (WQ), and CuratedTREC benchmarks.",
            "algorithms": ["Dense Passage Retrieval (DPR)", "BART", "Beam Search", "Marginalization Over Documents"],
            "experimental_setup": "Evaluated on 4x NVIDIA V100 GPUs using Wikipedia 2018 dump chunked into 100-word passages.",
            "results": "Achieved state-of-the-art exact match accuracy of 44.5% on Natural Questions Open Domain QA.",
            "evaluation_metrics": ["Exact Match (EM)", "F1 Score", "Rouge-L", "Retrieval Recall@K"],
            "limitations": [
                "Retrieval index lookup latency significantly degrades real-time response times during multi-hop iterative queries.",
                "Bi-encoder retrieval lacks reasoning over fine-grained numerical constraints and tabular entities.",
                "Prone to passive confirmation bias when retrieved passages themselves contain stale or contradictory information."
            ],
            "future_work": [
                "Joint end-to-end differentiable backpropagation through the dense index.",
                "Iterative self-correction mechanisms to verify retrieved context prior to generation."
            ],
            "conclusion": "RAG establishes a strong paradigm for non-parametric memory integration in generative neural models.",
            "evidence_snippets": [
                {
                    "claim": "Retrieval latency introduces substantial overhead during multi-step inference",
                    "section": "Limitations",
                    "page": 8,
                    "text": "The sequential bi-encoder lookup and subsequent cross-attention marginalization adds a 4.2x latency overhead compared to closed-book generation."
                }
            ]
        }
    },
    {
        "title": "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection",
        "original_filename": "asai2023_self_rag.pdf",
        "authors": ["Akari Asai", "Zeqiu Wu", "Yizhong Wang", "Avirup Sil", "Hannaneh Hajishirzi"],
        "publication_year": 2023,
        "venue": "ICLR 2024",
        "abstract": "Despite their remarkable capabilities, large language models (LLMs) often generate responses containing factual inaccuracies due to reliance on ungrounded parametrics. We introduce Self-RAG, a framework that trains a single LLM to dynamically retrieve passages on-demand and evaluate its own output using reflection tokens.",
        "page_count": 16,
        "raw_text": "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection. ABSTRACT: We introduce Self-RAG framework. 1. INTRODUCTION: Naive RAG indiscriminately retrieves passages regardless of whether retrieval is necessary, frequently adding irrelevant noise. 2. METHOD: We introduce reflection tokens [Retrieve], [IsRel], [IsSup], [IsUse] trained via offline critic models. 3. RESULTS: Outperforms vanilla RAG by 12.8% on PopQA while skipping retrieval on 40% of queries. 4. LIMITATIONS: Multi-token reflection beam search increases decoding latency by up to 3x, and critic models require extensive supervised training data. 5. FUTURE WORK: Adapting reflection mechanisms into parameter-efficient LoRA adapters.",
        "analysis": {
            "research_problem": "Conventional RAG indiscriminately retrieves documents even for simple queries, injecting misleading noise and unnecessary latency.",
            "research_objective": "To train an autonomous language model that dynamically decides when to retrieve, judges passage relevance, and validates factual support via self-reflection tokens.",
            "methodology": "Introduces special critique and reflection tokens ([Retrieve], [IsRel], [IsSup], [IsUse]) trained through offline critic distillation and controlled decoding beam search.",
            "dataset": "PopQA, TriviaQA-unfiltered, ARC-Challenge, and BioASQ biomedical QA.",
            "algorithms": ["Self-Reflection Token Sampling", "Critic Distillation", "Constrained Beam Search Decoding", "Segment-level Retrieval"],
            "experimental_setup": "Fine-tuned Llama-2-7B and 13B architectures with Contriever dense retrieval backend on 8x A100 GPUs.",
            "results": "Improved citation precision and accuracy by 12.8% over standard RAG while reducing redundant document fetches by 40%.",
            "evaluation_metrics": ["Citation Precision", "Citation Recall", "Factuality Score", "Inference Latency"],
            "limitations": [
                "Reflection beam search branching incurs a 2.8x decoding computational overhead compared to greedy decoding.",
                "Critic token calibration degrades on complex multi-hop reasoning tasks with conflicting evidence passages.",
                "High training resource requirements for generating synthetic critique supervision."
            ],
            "future_work": [
                "Low-rank parameter-efficient fine-tuning for reflection heads.",
                "Online reinforcement learning from verifiable automated proof checkers."
            ],
            "conclusion": "Self-RAG demonstrates that selective retrieval and self-critique substantially boost citation accuracy and factual fidelity.",
            "evidence_snippets": [
                {
                    "claim": "Multi-token reflection beam search increases decoding latency",
                    "section": "Computational Analysis",
                    "page": 11,
                    "text": "Evaluating candidate critique branches at every segment boundary increases average token generation time from 22ms to 64ms."
                }
            ]
        }
    },
    {
        "title": "Corrective Retrieval Augmented Generation (CRAG)",
        "original_filename": "yan2024_crag.pdf",
        "authors": ["Shi-Qi Yan", "Jia-Chen Gu", "Yun-Zhuo Zhu", "Zhen-Hua Ling"],
        "publication_year": 2024,
        "venue": "ArXiv Preprint 2024",
        "abstract": "In RAG, retrieval of irrelevant or low-quality documents inevitably misleads generation. We propose Corrective Retrieval Augmented Generation (CRAG) to improve the robustness of generation by introducing a lightweight retrieval evaluator and confidence-triggered web search fallback.",
        "page_count": 10,
        "raw_text": "Corrective Retrieval Augmented Generation (CRAG). ABSTRACT: We propose CRAG. 1. INTRODUCTION: Retrieved documents often contain non-factual or outdated information which LLMs fail to filter. 2. METHODOLOGY: A lightweight retrieval evaluator assesses confidence of retrieved passages: Correct, Incorrect, or Ambiguous. Ambiguous cases trigger web search query rewriting. 3. RESULTS: Increases accuracy across PopQA and PubHealth by 8.4%. 4. LIMITATIONS: Binary/tri-level evaluator confidence thresholds require manual heuristic tuning per domain, and web search fallback creates severe non-deterministic latency. 5. FUTURE WORK: Automated continuous threshold adaptation and multimodal verification.",
        "analysis": {
            "research_problem": "Retrieval systems frequently fetch irrelevant or erroneous documents, and generative models lack the capability to detect or correct bad context.",
            "research_objective": "To introduce a corrective retrieval evaluation filter that classifies retrieved document confidence and dynamically triggers knowledge refinement or external web search.",
            "methodology": "Employs a fine-tuned T5 retrieval evaluator to score passage relevance into Correct, Incorrect, or Ambiguous confidence intervals, applying decompose-and-recompose passage filtering.",
            "dataset": "PopQA, Biography, PubHealth, and Arc-e benchmarks.",
            "algorithms": ["Confidence Thresholding", "Decompose-and-Recompose Filtering", "Query Rewriting", "External Web Search Fallback"],
            "experimental_setup": "Tested on Llama-2-7B, Alpaca-7B, and ChatGPT-3.5 with BM25 and Contriever indices.",
            "results": "Achieved up to 8.4% improvement in hallucination reduction and factuality on PubHealth and PopQA.",
            "evaluation_metrics": ["Hallucination Rate", "Exact Match", "Factual Accuracy", "Search Query Count"],
            "limitations": [
                "Confidence thresholds (Correct vs Ambiguous vs Incorrect) require domain-specific manual tuning and fail under distribution shift.",
                "Web search fallback introduces unpredictable external latency (1.5s - 4.0s) and privacy compliance risks.",
                "Evaluator does not verify cross-passage logical contradictions within the retrieved set."
            ],
            "future_work": [
                "Self-calibrating probabilistic confidence estimators.",
                "Privacy-preserving local corpus knowledge synthesis."
            ],
            "conclusion": "CRAG proves that validating and correcting retrieved context prior to feeding LLMs is essential for robustness.",
            "evidence_snippets": [
                {
                    "claim": "Evaluator confidence thresholds require manual tuning and fail under distribution shift",
                    "section": "Limitations",
                    "page": 7,
                    "text": "Fixed scoring thresholds established on Wikipedia QA show a 19% drop in classification calibration when evaluated on biomedical datasets."
                }
            ]
        }
    },
    {
        "title": "Active Retrieval Augmented Generation for Long-Horizon Reasoning (FLARE)",
        "original_filename": "jiang2023_flare.pdf",
        "authors": ["Zhengbao Jiang", "Frank F. Xu", "Luyu Gao", "Zhiqing Sun", "Graham Neubig"],
        "publication_year": 2023,
        "venue": "EMNLP 2023",
        "abstract": "Existing RAG methods retrieve information either only at the beginning or at fixed intervals. We propose Forward-Looking Active REtrieval (FLARE), which monitors the generation process and actively retrieves external knowledge whenever confidence drops during upcoming sentence generation.",
        "page_count": 14,
        "raw_text": "Active Retrieval Augmented Generation for Long-Horizon Reasoning. ABSTRACT: We propose FLARE. 1. INTRODUCTION: Complex long-form generation requires retrieving information when the model is uncertain about what to say next, not just at fixed intervals. 2. METHODOLOGY: Forward-looking search: predicts the upcoming sentence, measures token probability confidence, and if low confidence is detected, generates a search query. 3. RESULTS: Outperforms standard single-step and fixed-interval retrieval across 4 long-form generation benchmarks. 4. LIMITATIONS: High token consumption due to speculative lookahead generation, and failure to resolve inter-sentence contradictory premises. 5. FUTURE WORK: Integrating speculative decoding trees to parallelize forward retrieval triggers.",
        "analysis": {
            "research_problem": "Fixed-interval retrieval fails for complex multi-step reasoning because models need external facts dynamically when uncertainty occurs.",
            "research_objective": "To trigger targeted external retrieval actively and selectively when the model anticipates generating low-confidence factual tokens in long-form generation.",
            "methodology": "Generates a tentative upcoming sentence, calculates token probability log-likelihoods; if confidence falls below threshold $\theta$, masks low-confidence tokens to formulate a targeted query, fetches evidence, and regenerates the sentence.",
            "dataset": "2WikiMultihopQA, HotpotQA, IIRC, and WikiAsp multi-hop datasets.",
            "algorithms": ["Forward-Looking Active Retrieval (FLARE)", "Log-Likelihood Confidence Masking", "Speculative Generation", "Multi-Hop Query Reformulation"],
            "experimental_setup": "Tested on GPT-3.5 (text-davinci-003) and LLaMA-13B across 1,000 multi-hop reasoning questions.",
            "results": "Achieved significant gains on multi-hop QA benchmarks, outperforming passive RAG by 5.2 to 8.7 F1 points.",
            "evaluation_metrics": ["Multi-Hop F1", "Exact Match", "Token Probability Uncertainty", "Query Overhead"],
            "limitations": [
                "Speculative lookahead drafting roughly doubles the number of generated tokens, increasing API inference costs by 2.1x.",
                "Prone to recursive query looping when initial low-confidence tokens stem from faulty foundational premises.",
                "Lacks formal safety verification or mathematical constraint checking on generated multi-hop inference chains."
            ],
            "future_work": [
                "Speculative parallelized tree decoding to amortize lookahead compute costs.",
                "Formal neuro-symbolic proof trace generation during multi-step reasoning."
            ],
            "conclusion": "Active forward-looking retrieval provides superior dynamic factual grounding for complex long-form narrative synthesis.",
            "evidence_snippets": [
                {
                    "claim": "Speculative lookahead generation increases inference token cost by 2.1x",
                    "section": "Efficiency Benchmark",
                    "page": 9,
                    "text": "Drafting tentative lookahead sentences prior to query formulation results in an average 210% increase in total generated token volume."
                }
            ]
        }
    },
    {
        "title": "Benchmarking and Mitigating Vulnerabilities of RAG Against Adversarial Corrupted Contexts",
        "original_filename": "zou2024_rag_security.pdf",
        "authors": ["Andy Zou", "Long Phan", "Justin Wang", "Dan Hendrycks", "Bo Li"],
        "publication_year": 2024,
        "venue": "ICML 2024",
        "abstract": "While RAG enhances language model capabilities, it opens a dangerous attack surface: adversarial documents injected into external vector stores can easily manipulate model outputs. We demonstrate that existing RAG pipelines have a 78% failure rate under PoisonedRag attacks and lack verified defense mechanisms.",
        "page_count": 15,
        "raw_text": "Benchmarking and Mitigating Vulnerabilities of RAG Against Adversarial Corrupted Contexts. ABSTRACT: We evaluate RAG security. 1. INTRODUCTION: External databases and web scrapes are inherently untrusted. Adversarial corpus poisoning can force language models to output malicious misinformation or system prompts. 2. EXPERIMENTS: Evaluated on 5 vector databases across 10,000 poisoned corpus documents. 3. RESULTS: State-of-the-art RAG models exhibit 78.4% attack success rate when only 3 malicious passages are injected. 4. LIMITATIONS: Proposed heuristic similarity filters reduce attack success rate but cause a 14.2% false-positive rejection rate on benign out-of-domain knowledge. 5. FUTURE WORK: Developing provable cryptographic or invariant neural verification architectures.",
        "analysis": {
            "research_problem": "RAG systems trust retrieved context unconditionally, rendering them highly vulnerable to malicious corpus poisoning, prompt injection, and hallucination propagation.",
            "research_objective": "To comprehensively benchmark RAG vulnerability against adversarial context poisoning and evaluate defensive filtering mechanisms.",
            "methodology": "Constructs benchmark PoisonedRag injecting adversarially optimized passages into dense vector indices; benchmarks defense mechanisms including perplexity filtering and re-ranking defenses.",
            "dataset": "MS-MARCO, NQ-Poisoned, and AdversarialHotpotQA.",
            "algorithms": ["Adversarial Gradient Optimization", "Perplexity Anomaly Detection", "Robust Reranking", "Cosine Perturbation Filter"],
            "experimental_setup": "Tested against Milvus, ChromaDB, and Faiss vector indices querying GPT-4, Claude-3, and Mistral-7B.",
            "results": "Demonstrated that injecting just 3 poisoned passages yields a 78.4% attack success rate on standard RAG pipelines.",
            "evaluation_metrics": ["Attack Success Rate (ASR)", "Benign Accuracy Retention (BAR)", "False Positive Rejection Rate"],
            "limitations": [
                "Existing defensive similarity filters reject 14.2% of legitimate, benign non-standard domain knowledge (high false positive rate).",
                "Defenses are completely blind to semantic contradictions across multiple retrieved chunks.",
                "No formal proof of correctness or verifiable execution boundaries exist for unstructured text inputs."
            ],
            "future_work": [
                "Developing invariant neuro-symbolic verifiers with zero false rejection on out-of-distribution benign text.",
                "Cross-chunk consistency graphs with automated contradiction pruning."
            ],
            "conclusion": "RAG architectures require rigorous adversarial defense and formal verification before safe deployment in enterprise settings.",
            "evidence_snippets": [
                {
                    "claim": "Heuristic defenses cause a 14.2% false-positive rejection rate on benign out-of-domain knowledge",
                    "section": "Defensive Trade-offs",
                    "page": 10,
                    "text": "Stricter perplexity and anomaly thresholds inadvertently discard legitimate specialized medical and legal domain passages."
                }
            ]
        }
    }
]

class DemoDatasetService:
    @staticmethod
    def get_demo_project_payload() -> Dict[str, Any]:
        return {
            "name": "Robust & Low-Latency Grounded LLM Reasoning Platform",
            "domain": "Artificial Intelligence / NLP",
            "topic": "Retrieval-Augmented Generation & Adversarial Robustness",
            "description": "Comprehensive comparative study of 5 seminal RAG architectures to identify generalizability, latency, and adversarial security research gaps.",
            "research_question": "How can we achieve verified factual accuracy and adversarial resilience in RAG systems without prohibitive decoding latency?",
            "papers": DEMO_PAPERS
        }
