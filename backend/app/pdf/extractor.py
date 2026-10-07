import re
import os
from typing import Dict, Any, List, Optional

try:
    import fitz  # PyMuPDF
    HAVE_PYMUPDF = True
except ImportError:
    HAVE_PYMUPDF = False

try:
    import pypdf
    HAVE_PYPDF = True
except ImportError:
    HAVE_PYPDF = False


class PDFExtractionResult:
    def __init__(
        self,
        title: str,
        authors: List[str],
        publication_year: Optional[int],
        abstract: str,
        page_count: int,
        raw_text: str,
        pages: List[Dict[str, Any]],
        sections: List[Dict[str, Any]],
        is_scanned: bool = False,
        error: Optional[str] = None
    ):
        self.title = title
        self.authors = authors
        self.publication_year = publication_year
        self.abstract = abstract
        self.page_count = page_count
        self.raw_text = raw_text
        self.pages = pages
        self.sections = sections
        self.is_scanned = is_scanned
        self.error = error


class PDFExtractor:
    @staticmethod
    def extract(file_path: str) -> PDFExtractionResult:
        if not os.path.exists(file_path):
            return PDFExtractionResult(
                title="Unknown Paper",
                authors=[],
                publication_year=None,
                abstract="",
                page_count=0,
                raw_text="",
                pages=[],
                sections=[],
                error=f"File not found: {file_path}"
            )

        if HAVE_PYMUPDF:
            return PDFExtractor._extract_pymupdf(file_path)
        elif HAVE_PYPDF:
            return PDFExtractor._extract_pypdf(file_path)
        else:
            return PDFExtractor._extract_fallback(file_path)

    @staticmethod
    def _extract_pymupdf(file_path: str) -> PDFExtractionResult:
        pages_data = []
        full_text_list = []
        is_encrypted = False
        
        try:
            doc = fitz.open(file_path)
            if doc.is_encrypted:
                try:
                    doc.authenticate("")
                except Exception:
                    return PDFExtractionResult(
                        title=os.path.basename(file_path),
                        authors=[],
                        publication_year=None,
                        abstract="",
                        page_count=0,
                        raw_text="",
                        pages=[],
                        sections=[],
                        error="Password-protected PDF file cannot be read without password."
                    )
            
            page_count = len(doc)
            total_chars = 0
            
            for page_idx in range(page_count):
                page = doc[page_idx]
                text = page.get_text("text")
                total_chars += len(text.strip())
                pages_data.append({
                    "page_number": page_idx + 1,
                    "text": text
                })
                full_text_list.append(text)
            
            doc.close()
            raw_text = "\n\n".join(full_text_list)

            # Check if PDF is scanned (very few characters across pages)
            is_scanned = (total_chars / max(page_count, 1)) < 50
            if is_scanned and total_chars < 100:
                return PDFExtractionResult(
                    title=os.path.basename(file_path).replace(".pdf", ""),
                    authors=[],
                    publication_year=None,
                    abstract="",
                    page_count=page_count,
                    raw_text="[SCANNED/IMAGE-ONLY PDF]: Text could not be extracted without OCR.",
                    pages=pages_data,
                    sections=[],
                    is_scanned=True,
                    error="This appears to be a scanned or image-only PDF. Please provide a text-based research PDF."
                )

            metadata = PDFExtractor._parse_metadata(raw_text, file_path)
            sections = PDFExtractor._detect_sections(pages_data)

            return PDFExtractionResult(
                title=metadata["title"],
                authors=metadata["authors"],
                publication_year=metadata["year"],
                abstract=metadata["abstract"],
                page_count=page_count,
                raw_text=raw_text,
                pages=pages_data,
                sections=sections,
                is_scanned=is_scanned
            )

        except Exception as e:
            return PDFExtractionResult(
                title=os.path.basename(file_path),
                authors=[],
                publication_year=None,
                abstract="",
                page_count=0,
                raw_text="",
                pages=[],
                sections=[],
                error=f"Error reading PDF: {str(e)}"
            )

    @staticmethod
    def _extract_pypdf(file_path: str) -> PDFExtractionResult:
        try:
            reader = pypdf.PdfReader(file_path)
            page_count = len(reader.pages)
            pages_data = []
            full_text_list = []
            
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                pages_data.append({
                    "page_number": idx + 1,
                    "text": text
                })
                full_text_list.append(text)
            
            raw_text = "\n\n".join(full_text_list)
            metadata = PDFExtractor._parse_metadata(raw_text, file_path)
            sections = PDFExtractor._detect_sections(pages_data)

            return PDFExtractionResult(
                title=metadata["title"],
                authors=metadata["authors"],
                publication_year=metadata["year"],
                abstract=metadata["abstract"],
                page_count=page_count,
                raw_text=raw_text,
                pages=pages_data,
                sections=sections
            )
        except Exception as e:
            return PDFExtractionResult(
                title=os.path.basename(file_path),
                authors=[],
                publication_year=None,
                abstract="",
                page_count=0,
                raw_text="",
                pages=[],
                sections=[],
                error=f"pypdf extraction error: {str(e)}"
            )

    @staticmethod
    def _extract_fallback(file_path: str) -> PDFExtractionResult:
        return PDFExtractionResult(
            title=os.path.basename(file_path),
            authors=[],
            publication_year=None,
            abstract="",
            page_count=0,
            raw_text="",
            pages=[],
            sections=[],
            error="No PDF extraction library available on system."
        )

    @staticmethod
    def _parse_metadata(text: str, file_path: str) -> Dict[str, Any]:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        # Title detection
        title = ""
        filename_fallback = os.path.basename(file_path).replace(".pdf", "").replace("_", " ").replace("-", " ")
        if lines:
            # First 1-3 lines usually contain the title
            candidate_lines = []
            for line in lines[:5]:
                if re.match(r'^(arXiv|IEEE|ACM|Springer|Elsevier|Nature|Volume|Page|\d+)', line, re.IGNORECASE):
                    continue
                if len(line) > 5 and not re.match(r'^(Abstract|Introduction|Keywords|Index Terms)', line, re.IGNORECASE):
                    candidate_lines.append(line)
                if len(candidate_lines) >= 2 or (candidate_lines and len(candidate_lines[0]) > 40):
                    break
            title = " ".join(candidate_lines) if candidate_lines else filename_fallback
        else:
            title = filename_fallback

        # Year detection
        year_match = re.search(r'\b(20[0-2][0-9]|199[0-9])\b', text[:2000])
        year = int(year_match.group(1)) if year_match else None

        # Authors detection heuristic
        authors = []
        for line in lines[1:8]:
            if any(term in line.lower() for term in ["department", "university", "institute", "school", "abstract", "email", "@"]):
                break
            # Check if looks like names separated by comma or 'and'
            if re.match(r'^[A-Z][a-zA-Z\.\s]+(,\s*[A-Z][a-zA-Z\.\s]+|\s+and\s+[A-Z][a-zA-Z\.\s]+)+', line):
                parts = re.split(r',|\band\b', line)
                authors = [p.strip() for p in parts if len(p.strip()) > 2]
                break

        # Abstract detection
        abstract = ""
        abstract_match = re.search(
            r'(?:ABSTRACT|Abstract)[:\s—\-]+(.*?)(?=\n\s*(?:(?:I\.|1\.)?\s*INTRODUCTION|Keywords|Index Terms|1\s+[A-Z]))',
            text,
            re.DOTALL | re.IGNORECASE
        )
        if abstract_match:
            abstract = re.sub(r'\s+', ' ', abstract_match.group(1).strip())
        elif "abstract" in text.lower():
            start_pos = text.lower().find("abstract")
            abstract_candidate = text[start_pos:start_pos+1500]
            abstract = re.sub(r'\s+', ' ', abstract_candidate.strip())

        return {
            "title": title[:400] if title else filename_fallback,
            "authors": authors[:10],
            "year": year,
            "abstract": abstract[:3000]
        }

    @staticmethod
    def _detect_sections(pages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        section_patterns = [
            ("abstract", r'\b(?:ABSTRACT|Abstract)\b'),
            ("introduction", r'\b(?:1\.?\s+|I\.?\s+)?(?:INTRODUCTION|Introduction)\b'),
            ("related_work", r'\b(?:2\.?\s+|II\.?\s+)?(?:RELATED WORK|Related Work|BACKGROUND|Background|LITERATURE REVIEW)\b'),
            ("methodology", r'\b(?:\d\.?\s+|[IVX]+\.?\s+)?(?:METHODOLOGY|Methodology|PROPOSED METHOD|Proposed Approach|SYSTEM ARCHITECTURE|MATERIALS AND METHODS|FRAMEWORK)\b'),
            ("experiments", r'\b(?:\d\.?\s+|[IVX]+\.?\s+)?(?:EXPERIMENTS|Experiments|EXPERIMENTAL SETUP|EVALUATION|Evaluation|DATASET|IMPLEMENTATION DETAILS)\b'),
            ("results", r'\b(?:\d\.?\s+|[IVX]+\.?\s+)?(?:RESULTS|Results|EMPIRICAL RESULTS|PERFORMANCE ANALYSIS|FINDINGS)\b'),
            ("discussion", r'\b(?:\d\.?\s+|[IVX]+\.?\s+)?(?:DISCUSSION|Discussion|ABLATION STUDY)\b'),
            ("limitations", r'\b(?:\d\.?\s+|[IVX]+\.?\s+)?(?:LIMITATIONS|Limitations|THREATS TO VALIDITY)\b'),
            ("future_work", r'\b(?:\d\.?\s+|[IVX]+\.?\s+)?(?:FUTURE WORK|Future Work|FUTURE DIRECTIONS)\b'),
            ("conclusion", r'\b(?:\d\.?\s+|[IVX]+\.?\s+)?(?:CONCLUSION|Conclusion|CONCLUDING REMARKS)\b')
        ]

        sections = []
        current_section = {
            "section_title": "Overview / Preamble",
            "section_type": "preamble",
            "content": "",
            "start_page": 1,
            "end_page": 1
        }

        for page in pages_data:
            p_num = page["page_number"]
            text = page["text"]
            lines = text.split("\n")

            for line in lines:
                matched_type = None
                matched_title = None
                clean_line = line.strip()

                if len(clean_line) < 60:  # Heading candidate
                    for s_type, pat in section_patterns:
                        if re.search(pat, clean_line):
                            matched_type = s_type
                            matched_title = clean_line
                            break

                if matched_type:
                    # Save current section if not empty
                    if current_section["content"].strip():
                        sections.append(current_section)
                    current_section = {
                        "section_title": matched_title or matched_type.capitalize(),
                        "section_type": matched_type,
                        "content": clean_line + "\n",
                        "start_page": p_num,
                        "end_page": p_num
                    }
                else:
                    current_section["content"] += line + "\n"
                    current_section["end_page"] = p_num

        if current_section["content"].strip():
            sections.append(current_section)

        return sections
