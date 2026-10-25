"use client";

import styles from "./HowItWorks.module.css";
import { motion } from "framer-motion";
import { Building, Landmark, Briefcase, CheckCircle, FileText, ChevronLeft, ShieldCheck, BarChart3, Banknote } from "lucide-react";

export default function HowItWorks() {
  const scrollVariants: any = {
    hidden: { opacity: 0, y: 50, rotateX: -15, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0, 
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const floatVariants: any = {
    float1: { y: [0, -12, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
    float2: { y: [0, 10, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } },
    float3: { y: [0, -8, 0], transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }
  };

  return (
    <section id="how-it-works" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>
            كيف تعمل <span className={styles.titleHighlight}>مَشيد</span>؟
          </h2>
          <p className={styles.subtitle}>
            نظام متكامل يعتمد على التقنية المتقدمة لإدارة أوقافك. خطوات بسيطة تفصلك عن أثر لا ينقطع.
          </p>
        </div>

        <div className={styles.stepsContainer}>
          {/* Step 1 */}
          <div className={styles.stepRow}>
            <div className={styles.textContent}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>أضف أوقافك</h3>
              <p className={styles.stepDesc}>
                وثق أصولك الوقفية سواء كانت عقارات، محافظ استثمارية، أو أوقاف نقدية. سجل رقمي موحد يعطيك نظرة شاملة على كافة ممتلكاتك الوقفية وتفاصيلها.
              </p>
            </div>
            
            <div className={styles.visualContent}>
              <motion.div 
                className={styles.elegantCard}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={scrollVariants}
              >
                <motion.div variants={floatVariants} animate="float1" className={styles.cardInner}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIconWrapper} style={{ background: '#E0E7FF', color: '#4F46E5' }}>
                      <BarChart3 size={20} />
                    </div>
                    <span className={styles.cardTitle}>إجمالي الأصول الوقفية</span>
                  </div>
                  <div className={styles.bigNumber}>84.5M <span className={styles.currency}>ر.س</span></div>
                  
                  <div className={styles.assetsList}>
                    <div className={styles.assetItem}>
                      <div className={styles.assetIcon} style={{ background: '#DCFCE7', color: '#16A34A' }}>
                        <Building size={16} />
                      </div>
                      <div className={styles.assetInfo}>
                        <div className={styles.assetName}>عقارات تجارية</div>
                        <div className={styles.assetValue}>45.2M ر.س</div>
                      </div>
                    </div>
                    <div className={styles.assetItem}>
                      <div className={styles.assetIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
                        <Landmark size={16} />
                      </div>
                      <div className={styles.assetInfo}>
                        <div className={styles.assetName}>صناديق استثمارية</div>
                        <div className={styles.assetValue}>28.1M ر.س</div>
                      </div>
                    </div>
                    <div className={styles.assetItem}>
                      <div className={styles.assetIcon} style={{ background: '#F3E8FF', color: '#9333EA' }}>
                        <Banknote size={16} />
                      </div>
                      <div className={styles.assetInfo}>
                        <div className={styles.assetName}>أرصدة نقدية</div>
                        <div className={styles.assetValue}>11.2M ر.س</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={styles.stepRow}>
            <div className={styles.textContent}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>حوكم وأدر بذكاء</h3>
              <p className={styles.stepDesc}>
                انضم إلى نظام محاسبي ومالي متكامل يدير الإيجارات، وتوزيع الأرباح، ويستخرج تقارير متوافقة مع متطلبات الهيئة العامة للأوقاف (GAW).
              </p>
            </div>
            <div className={styles.visualContent}>
              <motion.div 
                className={styles.elegantCard}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={scrollVariants}
              >
                <motion.div variants={floatVariants} animate="float2" className={styles.cardInner}>
                  <div className={styles.complianceHeader}>
                    <ShieldCheck size={32} color="#10B981" />
                    <div>
                      <div className={styles.complianceTitle}>حالة الامتثال (GAW)</div>
                      <div className={styles.complianceStatus}>مكتمل 100%</div>
                    </div>
                  </div>
                  
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.progressTrack}>
                      <motion.div 
                        className={styles.progressFill}
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className={styles.checkList}>
                    <div className={styles.checkItem}>
                      <CheckCircle size={16} color="#10B981" />
                      <span>القوائم المالية المعتمدة</span>
                    </div>
                    <div className={styles.checkItem}>
                      <CheckCircle size={16} color="#10B981" />
                      <span>تقرير مجلس النظارة</span>
                    </div>
                    <div className={styles.checkItem}>
                      <CheckCircle size={16} color="#10B981" />
                      <span>سجلات الصرف للمستفيدين</span>
                    </div>
                  </div>

                  <button className={styles.exportBtn}>
                    تصدير التقرير النهائي
                    <ChevronLeft size={16} />
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={styles.stepRow}>
            <div className={styles.textContent}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>اصرف الريع بشفافية</h3>
              <p className={styles.stepDesc}>
                بمجرد تحقيق الأرباح، يتم توجيه الريع آلياً للمستفيدين المحددين في شرط الواقف. تتبع الأثر وشارك التقارير بشفافية تامة.
              </p>
            </div>
            <div className={styles.visualContent}>
              <motion.div 
                className={styles.elegantCard}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={scrollVariants}
              >
                <motion.div variants={floatVariants} animate="float3" className={styles.cardInner}>
                  <div className={styles.invoiceHeader}>
                    <div className={styles.invoiceIcon}>
                      <FileText size={24} />
                    </div>
                    <div className={styles.invoiceTitle}>سند صرف معتمد</div>
                    <div className={styles.invoiceSubtitle}>جمعية تحفيظ القرآن الكريم</div>
                  </div>
                  
                  <div className={styles.dashedLine}></div>
                  
                  <div className={styles.invoiceRow}>
                    <span className={styles.invoiceLabel}>المبلغ الإجمالي</span>
                    <span className={styles.invoiceAmount}>120,500 <span className={styles.currency}>ر.س</span></span>
                  </div>
                  
                  <div className={styles.invoiceRow}>
                    <span className={styles.invoiceLabel}>تاريخ التنفيذ</span>
                    <span className={styles.invoiceValue}>15 شعبان 1446 هـ</span>
                  </div>

                  <div className={styles.invoiceRow}>
                    <span className={styles.invoiceLabel}>رقم الحوالة</span>
                    <span className={styles.invoiceValue}>TRX-982441</span>
                  </div>
                  
                  <div className={styles.successBadge}>
                    <CheckCircle size={18} />
                    <span>تم التحويل بنجاح للمستفيد</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
