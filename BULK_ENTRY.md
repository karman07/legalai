# 📂 LegalAI Bulk Document Entry Guide

This document provides the technical specifications for uploading legal documents (PDF/MD) to the LegalAI platform. Use this guide to prepare your metadata and understand the API requirements.

---

## 🏗️ Document Data Schema

Each document entry in the database follows this schema. Fields marked with "Dummy Value" will be automatically populated if not provided.

| Field Name | Type | Description | Required | Default / Dummy Value |
| :--- | :--- | :--- | :---: | :--- |
| **title** | `String` | **Primary title of the document.** | ✅ | - |
| **category** | `String` | Document classification. | ❌ | "Information Not Available" |
| **diary_no** | `String` | Legal diary number. | ❌ | "Information Not Available" |
| **case_no** | `String` | Official case number. | ❌ | "Information Not Available" |
| **pet** | `String` | Petitioner name. | ❌ | "Information Not Available" |
| **pet_adv** | `String` | Petitioner's Advocate. | ❌ | "Information Not Available" |
| **res_adv** | `String` | Respondent's Advocate. | ❌ | "Information Not Available" |
| **bench** | `String` | Presiding bench/judges. | ❌ | "Information Not Available" |
| **judgement_by** | `String` | Judge who delivered the order. | ❌ | "Information Not Available" |
| **judgment_dates** | `Date` | Date of the judgement. | ❌ | - |
| **isActive** | `Boolean` | Visibility status. | ❌ | `true` |

---

## 🚀 API Endpoint (Single Upload)

Use this endpoint to upload a document file along with its metadata.

### **Upload Document**
`POST /admin/pdfs`

**Authentication:** Admin Token Required (`Authorization: Bearer <token>`)  
**Format:** `multipart/form-data`

#### **Request Body Parameters**
| Key | Type | Description |
| :--- | :--- | :--- |
| **title** | `Text` | **The title of the document (Required)** |
| **category** | `Text` | Category of the document |
| **files** | `File` | The file to upload (PDF, MD, etc.) |
| **court** | `JSON` | (Optional) Court level and name metadata |
| **diary_no** | `Text` | (Optional) Diary number |

#### **Example cURL Request**
```bash
curl -X POST http://api.legalai.com/admin/pdfs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Kesavananda Bharati v. State of Kerala" \
  -F "category=Constitutional" \
  -F "files=@/path/to/judgement.pdf"
```

---

## 📝 Bulk Entry Template

To prepare documents for bulk entry, structure your markdown file as follows:

### **Document List**

#### 1. Fundamental Rights Judgement
- **Title:** Supreme Court Verdict on Privacy
- **Category:** Constitutional
- **Diary No:** D-5542/2024
- **Petitioner:** Justice K.S. Puttaswamy
- **File:** `privacy_verdict.pdf`

#### 2. Environmental Law Review
- **Title:** Guidelines for Industrial Waste
- **Category:** Environmental
- **Diary No:** D-1123/2023
- **Bench:** NGT Principal Bench
- **File:** `industrial_waste.md`

---

> **Note:** The `title` field is essential for indexing and search functionality. Always ensure it is accurately provided.
