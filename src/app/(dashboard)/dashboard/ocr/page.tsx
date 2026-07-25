"use client";

import { useState } from "react";
import styles from "./ocr.module.css";

export default function OCRPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setResult({
        sukukType: "صك وقف منجز",
        waqfName: "وقف الوالدين بمكة المكرمة",
        sukukNo: "١١٩٨٧٤٥٣٢١",
        date: "١٤٤٧/٠٥/١٠ هـ",
        conditions: "يصرف ٥٠٪ للفقراء، ٢٥٪ تحبيس، ٢٥٪ صيانة",
        confidence: "٩٨.٥٪"
      });
      setIsScanning(false);
    }, 2500);
  };

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1>المؤرشف الذكي - تقنية OCR</h1>
        <p>رفع الصكوك الورقية القديمة وتحويلها إلى بيانات رقمية مهيكلة آلياً.</p>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.uploadSection} glass-card`}>
          <div className={styles.dropzone}>
            <span className={styles.uploadIcon}>📄</span>
            <h3>اسحب صورة الصك هنا</h3>
            <p>أو انقر لاختيار ملف من جهازك</p>
            <button className="btn-primary" onClick={startScan}>
              {isScanning ? "جاري المسح الضوئي..." : "بدء المعالجة الذكية"}
            </button>
          </div>
          
          <div className={styles.info}>
            <h4>تعليمات المسح:</h4>
            <ul>
              <li>تأكد من وضوح الخط والأرقام.</li>
              <li>يدعم الصكوك المكتوبة يدوياً أو آلياً.</li>
              <li>يتم تشفير الوثيقة فور رفعها.</li>
            </ul>
          </div>
        </div>

        <div className={`${styles.resultSection} glass-card`}>
          <div className={styles.resHeader}>
            <h3>نتائج الاستخراج الرقمي</h3>
            {result && <span className={styles.confidence}>دقة المعالجة: {result.confidence}</span>}
          </div>
          
          {result ? (
            <div className={styles.results}>
              <div className={styles.resItem}>
                <label>نوع الصك</label>
                <div className={styles.val}>{result.sukukType}</div>
              </div>
              <div className={styles.resItem}>
                <label>اسم الوقف</label>
                <div className={styles.val}>{result.waqfName}</div>
              </div>
              <div className={styles.resItem}>
                <label>رقم الصك</label>
                <div className={styles.val}>{result.sukukNo}</div>
              </div>
              <div className={styles.resItem}>
                <label>التاريخ</label>
                <div className={styles.val}>{result.date}</div>
              </div>
              <div className={styles.resItem}>
                <label>شروط الواقف (مستخلص آلي)</label>
                <div className={styles.val}>{result.conditions}</div>
              </div>
              <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>اعتماد البيانات وحفظها</button>
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.scannerLine}></div>
              <p>بانتظار رفع الوثيقة...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
