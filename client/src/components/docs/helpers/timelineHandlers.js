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
    let myTimeline = getGlobal().myTimeline;
    myTimeline["title"] = object;
    setGlobal({ myTimeline })
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
    let myTimeline = getGlobal().myTimeline;
    let timelineEvents = myTimeline.events;
    timelineEvents.push(object);
    console.log(timelineEvents);
    myTimeline["events"] = timelineEvents;
    setGlobal({myTimeline});
  }
  
  export async function handleTimelineSave() {
    const myTimeline = getGlobal().myTimeline;
    setGlobal({ myTimeline });
  }
  
  export async function handleDeleteTimelineEvent(id) {
    let myTimeline = await getGlobal().myTimeline;
    let events = myTimeline.events;
    let index = await events.map((x) => {return x.unique_id }).indexOf(id);
    console.log(index);
    if (index > -1) {
      events.splice(index, 1);
    }
    myTimeline["events"] = events;
    setGlobal({ myTimeline });
  }