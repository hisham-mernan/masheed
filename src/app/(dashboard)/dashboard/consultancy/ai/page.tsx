import AssistantChat from "@/components/dashboard/AssistantChat";
import styles from "../../assets/assets.module.css";

export default function AIConsultancyPage() {
  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>المساعد الاستشاري الذكي</h1>
          <p>إجابات فورية محسوبة من بيانات وقفك الفعلية — زكاة، ريع، صيانة، جاهزية طرح، وحوكمة.</p>
        </div>
      </div>
      <AssistantChat />
    </div>
  );
}
