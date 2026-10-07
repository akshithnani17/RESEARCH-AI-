import re
from typing import List, Dict, Any

class TextChunker:
    @staticmethod
    def chunk_paper(
        pages_data: List[Dict[str, Any]],
        sections_data: List[Dict[str, Any]],
        chunk_size: int = 600,
        chunk_overlap: int = 100
    ) -> List[Dict[str, Any]]:
        chunks = []
        chunk_idx = 0

        # We create chunks retaining page number and section context
        for page in pages_data:
            page_num = page["page_number"]
            page_text = page["text"]
            
            # Find the most relevant section for this page
            page_section = "General"
            for sec in sections_data:
                if sec["start_page"] <= page_num <= sec["end_page"]:
                    page_section = sec["section_title"]
                    break

            # Tokenize into sentences / paragraphs
            paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]
            current_chunk_words = []
            current_len = 0

            for para in paragraphs:
                words = para.split()
                if not words:
                    continue

                if current_len + len(words) <= chunk_size:
                    current_chunk_words.extend(words)
                    current_len += len(words)
                else:
                    if current_chunk_words:
                        chunk_text = " ".join(current_chunk_words)
                        chunks.append({
                            "chunk_index": chunk_idx,
                            "content": chunk_text,
                            "section_name": page_section,
                            "page_number": page_num
                        })
                        chunk_idx += 1
                        # Retain overlap
                        overlap_words = current_chunk_words[-chunk_overlap:] if len(current_chunk_words) > chunk_overlap else []
                        current_chunk_words = list(overlap_words) + words
                        current_len = len(current_chunk_words)
                    else:
                        # Single huge paragraph
                        for i in range(0, len(words), chunk_size - chunk_overlap):
                            slice_words = words[i:i + chunk_size]
                            chunks.append({
                                "chunk_index": chunk_idx,
                                "content": " ".join(slice_words),
                                "section_name": page_section,
                                "page_number": page_num
                            })
                            chunk_idx += 1
                        current_chunk_words = []
                        current_len = 0

            if current_chunk_words:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "content": " ".join(current_chunk_words),
                    "section_name": page_section,
                    "page_number": page_num
                })
                chunk_idx += 1

        return chunks
