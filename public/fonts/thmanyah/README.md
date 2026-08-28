# ملفات خط ثمانية

يحتوي هذا المجلد على ملفات WOFF2 التي يستخدمها التطبيق فقط. تم استبعاد ملفات OTF والأوزان والنسخ غير المستخدمة لتقليل حجم التحميل.

الأسماء المتوقعة حاليًا:

```text
ThmanyahSans-Regular.woff2
ThmanyahSans-Medium.woff2
ThmanyahSans-Bold.woff2
ThmanyahSerifDisplay-Bold.woff2
ThmanyahSerifText-Regular.woff2
ThmanyahSerifText-Medium.woff2
```

إذا استُبدلت الملفات أو اختلفت أسماؤها، حدّث مسارات `@font-face` في `src/app/globals.css`. يستخدم الموقع خطوطًا عربية نظامية عند غيابها، لذلك لن يتعطل البناء.

تستخدم الواجهة `Thmanyah Sans`، وتستخدم البطاقة `Thmanyah Serif Display` لاسم عبد الله و`Thmanyah Serif Text` لنص التهنئة.
