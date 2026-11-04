import AssistantChat from "@/components/dashboard/AssistantChat";
import styles from "../../assets/assets.module.css";

export default function AIConsultancyPage() {
  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>مساعد بيانات الوقف</h1>
          <p>ملخصات جاهزة محسوبة من بيانات وقفك عن ستة مواضيع: الزكاة، الريع، الصيانة، الطرح، الحوكمة، والتقارير. لا يستخدم نموذج ذكاء اصطناعي بعد.</p>
        </div>
      </div>
      <AssistantChat />
    </div>
  );
}
