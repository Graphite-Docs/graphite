import { getGlobal, setGlobal } from 'reactn';

export function handleTimelineTitleMediaUrl(e) {
    setGlobal({ timelineTitleMediaUrl: e.target.value });
  }
  
  export function handleTimelineTitleMediaCaption(e) {
    setGlobal({ timelineTitleMediaCaption: e.target.value });
  }
  
  export function handleTimelineTitleMediaCredit(e) {
    setGlobal({ timelineTitleMediaCredit: e.target.value });
  }
  
  export function handleTimelineTitleTextHeadline(e) {
    console.log("doing it");
    setGlobal({ timelineTitleTextHeadline: e.target.value });
  }
  
  export function handleTimelineTitleTextText(e) {
    setGlobal({ timelineTitleTextText: e.target.value });
  }
  
  export function handleTimelineEventMediaUrl(e) {
    setGlobal({ timelineEventMediaUrl: e.target.value });
  }
  
  export function handleTimelineEventMediaCaption(e) {
    setGlobal({ timelineEventMediaCaption: e.target.value });
  }
  
  export function handleTimelineEventMediaCredit(e) {
    setGlobal({ timelineEventMediaCredit: e.target.value });
  }
  
  export function handleTimelineEventStartMonth(e) {
    setGlobal({ timelineEventStartMonth: e.target.value });
  }
  
  export function handleTimelineEventStartDay(e) {
    setGlobal({ timelineEventStartDay: e.target.value });
  }
  
  export function handleTimelineEventStartYear(e) {
    setGlobal({ timelineEventStartYear: e.target.value });
  }
  
  export function handleTimelineEventTextHeadline(e) {
    setGlobal({ timelineEventTextHeadline: e.target.value });
  }
  
  export function handleTimelineEventTextText(e) {
    setGlobal({ timelineEventTextText: e.target.value });
  }
  
  export function handleUpdateTimelineTitle() {
    const object = {};
    const media = {};
    const text = {};
    media.url = getGlobal().timelineTitleMediaUrl;
    media.caption = getGlobal().timelineTitleMediaCaption;
    media.credit = getGlobal().timelineTitleMediaCredit;
    text.headline = getGlobal().timelineTitleTextHeadline;
    text.text = getGlobal().timelineTitleTextText;
    object.media = media;
    object.text = text;
    setGlobal({ timelineTitle: object }, () => {
      const timelineObj = {};
      timelineObj.title = getGlobal().timelineTitle;
      timelineObj.events = getGlobal().timelineEvents;
      setGlobal({ myTimeline: timelineObj });
    });
  }
  
  export function handleAddNewTimelineEvent() {
    const object = {};
    const media = {};
    const start_date = {};
    const text = {};
    media.url = getGlobal().timelineEventMediaUrl;
    media.caption = getGlobal().timelineEventMediaCaption;
    media.credit = getGlobal().timelineEventMediaCredit;
    start_date.month = getGlobal().timelineEventStartMonth;
    start_date.day = getGlobal().timelineEventStartDay;
    start_date.year = getGlobal().timelineEventStartYear;
    text.headline = getGlobal().timelineEventTextHeadline;
    text.text = getGlobal().timelineEventTextText;
    object.media = media;
    object.start_date = start_date;
    object.text = text;
    object.unique_id = Date.now();
    setGlobal(
      { timelineEvents: [...getGlobal().timelineEvents, object] },
      () => {
        const timelineObj = {};
        timelineObj.title = getGlobal().timelineTitle;
        timelineObj.events = getGlobal().timelineEvents;
        setGlobal({ myTimeline: timelineObj });
      }
    );
  }
  
  export async function handleTimelineSave() {
    const object = {};
    object.title = getGlobal().timelineTitle;
    object.events = getGlobal().timelineEvents;
    setGlobal({ myTimeline: object });
  }
  
  export function handleDeleteTimelineEvent(id) {
    let events = getGlobal().timelineEvents;
    console.log(events);
    let index = events.findIndex(a => a.unique_id === id);
    if (index > -1) {
      events.splice(index, 1);
    }
    setGlobal({ timelineEvents: events }, () => {
      handleTimelineSave();
    });
  }