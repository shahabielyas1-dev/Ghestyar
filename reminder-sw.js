/* Ghestyar 3.5: notification click handler only. No background scheduling, no caching financial data. */
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const url=new URL('./#reminders',self.registration.scope).href;
    const all=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of all){
      if(client.url.startsWith(self.registration.scope)){
        await client.focus();client.postMessage({type:'ghestyar-reminder-open'});return;
      }
    }
    if(clients.openWindow)await clients.openWindow(url);
  })());
});

/* Ghestyar 3.6: genuine background Push — generic text only, no financial identifiers. */
self.addEventListener('push',event=>{
  let payload={};try{payload=event.data?.json()||{};}catch{}
  if(payload.type!=='ghestyar-reminder')return;
  const count=Math.min(99,Math.max(0,Number(payload.count)||0));
  const overdue=Math.min(count,Math.max(0,Number(payload.overdue)||0));
  if(!count)return;
  event.waitUntil(self.registration.showNotification('قسط‌یار | یادآوری اقساط',{
    body:`${count} قسط نیازمند پیگیری${overdue?' · '+overdue+' معوق':''}. برای جزئیات وارد حساب خود شو.`,
    tag:'ghestyar-server-due',renotify:false,dir:'rtl',lang:'fa',
    data:{url:new URL('./#reminders',self.registration.scope).href}
  }));
});
