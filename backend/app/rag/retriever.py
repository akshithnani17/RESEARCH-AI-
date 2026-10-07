import re
import math
from typing import List, Dict, Any, Optional
import numpy as np

class HybridRetriever:
    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        a = np.array(v1)
        b = np.array(v2)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

    @staticmethod
    def compute_tfidf_embeddings(corpus: List[str]) -> List[List[float]]:
        # Simple pure Python / numpy TF-IDF vectorizer to be 100% dependency-safe & fast
        tokenized_corpus = [re.findall(r'\b\w{3,}\b', doc.lower()) for doc in corpus]
        vocab = list(set(word for doc in tokenized_corpus for word in doc))
        word_to_idx = {w: i for i, w in enumerate(vocab)}
        
        num_docs = len(corpus)
        idf = {}
        for w in vocab:
            doc_count = sum(1 for doc in tokenized_corpus if w in doc)
            idf[w] = math.log((num_docs + 1) / (doc_count + 1)) + 1.0

        vectors = []
        for doc in tokenized_corpus:
            tf = {}
            for w in doc:
                tf[w] = tf.get(w, 0) + 1
            
            vec = [0.0] * len(vocab)
            for w, count in tf.items():
                if w in word_to_idx:
                    vec[word_to_idx[w]] = (count / max(len(doc), 1)) * idf[w]
            vectors.append(vec)

        return vectors

    @staticmethod
    def keyword_score(query: str, text: str) -> float:
        q_words = set(re.findall(r'\b\w{3,}\b', query.lower()))
        t_words = set(re.findall(r'\b\w{3,}\b', text.lower()))
        if not q_words or not t_words:
            return 0.0
        intersection = q_words.intersection(t_words)
        return len(intersection) / len(q_words)

    @classmethod
    def search_chunks(
        cls,
        query: str,
        chunks: List[Dict[str, Any]],
        top_k: int = 8
    ) -> List[Dict[str, Any]]:
        if not chunks:
            return []

        scored_results = []
        corpus_texts = [c["content"] for c in chunks]
        
        # Keyword and semantic heuristic match
        for idx, chunk in enumerate(chunks):
            k_score = cls.keyword_score(query, chunk["content"])
            
            # Boost score if query keywords appear in section name
            section_boost = 0.2 if chunk.get("section_name") and any(
                qw in chunk["section_name"].lower() for qw in query.lower().split()
            ) else 0.0

            total_score = (0.8 * k_score) + section_boost
            
            scored_results.append({
                "chunk": chunk,
                "score": total_score
            })

        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return [item["chunk"] for item in scored_results[:top_k]]
