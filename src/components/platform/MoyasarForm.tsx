"use client";

import { useEffect, useRef, useState } from "react";
import { s } from "./ui";

const MPF = "https://cdn.moyasar.com/mpf/1.16.0";

type MoyasarGlobal = { init: (config: Record<string, unknown>) => void };
declare global { interface Window { Moyasar?: MoyasarGlobal } }

function loadOnce(tag: "script" | "link", url: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`[data-mpf="${url}"]`)) return resolve();
    const el = document.createElement(tag);
    el.dataset.mpf = url;
    if (tag === "script") (el as HTMLScriptElement).src = url;
    else Object.assign(el as HTMLLinkElement, { rel: "stylesheet", href: url });
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("load " + url));
    document.head.appendChild(el);
  });
}

// Moyasar's hosted card form. The amount is fixed by the server-created payment row,
// and the result is verified with Moyasar on the callback before anything is unlocked.
export default function MoyasarForm(props: { amount: number; description: string; publishableKey: string; callbackUrl: string; paymentId: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const { amount, description, publishableKey, callbackUrl, paymentId } = props;

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadOnce("link", `${MPF}/moyasar.css`), loadOnce("script", `${MPF}/moyasar.js`)])
      .then(() => {
        if (cancelled || !box.current || !window.Moyasar) return;
        box.current.innerHTML = "";
        window.Moyasar.init({
          element: box.current,
          amount,
          currency: "SAR",
          description,
          publishable_api_key: publishableKey,
          callback_url: callbackUrl,
          language: "ar",
          methods: ["creditcard"],
          supported_networks: ["mada", "visa", "mastercard"],
          metadata: { payment_id: paymentId },
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, [amount, description, publishableKey, callbackUrl, paymentId]);

  if (failed) return <div className={`${s.alert} ${s.alertErr}`} role="alert">تعذّر تحميل نموذج الدفع. تحقق من اتصالك وأعد تحميل الصفحة.</div>;
  return <div ref={box} className="mysr-form" dir="rtl" style={{ minHeight: 280 }} />;
}
