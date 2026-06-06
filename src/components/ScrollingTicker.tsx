import React from 'react';

export default function ScrollingTicker() {
  const notices = [
    '📺 লাইভ টিভি সার্ভারে আপনাকে স্বাগতম! অতি অল্প বাফারিংয়ে উপভোগ করুন আপনার প্রিয় ৬৭টি বাংলা ও আন্তর্জাতিক স্পোর্টস এবং বিনোদন চ্যানেল।',
    '⚡ স্টার জলসা, জি বাংলা, সনি আট সহ সব জনপ্রিয় বিনোদন চ্যানেল এখন সম্পূর্ণ পরিষ্কার স্ট্রিমিং কোয়ালিটিতে উপভোগ করুন।',
    '🏆 খেলাপ্রেমীদের জন্য রয়েছে টি-স্পোর্টস, সনি টেন, স্টার স্পোর্টস এবং ফিফা প্লাস সহ জনপ্রিয় সকল লাইভ খেলাধুলার সরাসরি সম্প্রচার।',
    '🔥 যেকোনো চ্যানেলের লোগোর উপর টাচ করলেই সরাসরি ভিডিও ডিসপ্লে ওপেন হবে এবং সুন্দরভাবে লাইভ খেলা ও নাটক দেখতে পারবেন।',
    '🌐 কোনো ধরনের বাড়তি অ্যাপ বা কোড ঝামেলা ছাড়াই আমাদের প্লেয়ার সরাসরি সকল ডিভাইসে প্লে সাপোর্ট করে।'
  ];

  const fullText = notices.join('   •   ');

  return (
    <div 
      id="top-scrolling-ticker"
      className="relative w-full bg-black border-b border-cyan-950/40 py-2.5 overflow-hidden z-50 text-xs tracking-wider select-none shadow-[0_1px_15px_rgba(6,182,212,0.15)] font-sans"
    >
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      
      <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite] text-cyan-400">
        <span className="inline-block px-4 font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {fullText}
        </span>
        <span className="inline-block px-4 font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {fullText}
        </span>
      </div>
    </div>
  );
}
