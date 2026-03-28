import type { EventDetail, EventListItem } from "@/types/eventsApi";

/** モック詳細・編集の「自分」と整合させる user id */
export const MOCK_MY_USER_ID = 1;

export function getMockMyProfile() {
  return {
    id: MOCK_MY_USER_ID,
    name: "デモユーザー",
    gender: 0,
    birth_date: "1990-01-01",
    bio: "API 未接続のプレビュー用です。",
    image_key: null as string | null,
    profile_detail_completed: true,
  };
}

function iso(daysFromNow: number, hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function seedDetails(): EventDetail[] {
  return [
    {
      id: 1,
      title: "週末カフェ会（あなたが幹事）",
      description: "ゆるく話すだけの会です。モック用のイベントです。",
      place: "渋谷某所",
      starts_at: iso(3, 14, 0),
      capacity: 10,
      joined_count: 2,
      status: "OPEN",
      image_key: null,
      owner: {
        user_id: MOCK_MY_USER_ID,
        name: "デモユーザー",
        image_key: null,
      },
      participants: [
        { user_id: 201, name: "参加者A", bio: null, image_key: null },
        { user_id: 202, name: "参加者B", bio: null, image_key: null },
      ],
      mood: {
        firstMeet: 40,
        casual: 70,
        active: 30,
        calm: 60,
        indoor: 80,
        outdoor: 20,
      },
      scheduleItems: [
        { id: "s1", title: "受付・自己紹介", minutes: 20 },
        { id: "s2", title: "フリートーク", minutes: 60 },
      ],
      ruleText: "モック用のルールテキストです。",
      restrictions: {
        ageRange: "20–40歳",
        scale: "小規模（〜10名）",
        capacityText: null,
        level: null,
      },
      locationNote: "駅から徒歩5分",
      reservationNote: "当日キャンセルは連絡ください（デモ）",
    },
    {
      id: 2,
      title: "ナイトランニング",
      description: "参加ボタンの動作確認用。幹事は別ユーザーです。",
      place: "皇居外苑",
      starts_at: iso(7, 19, 30),
      capacity: 6,
      joined_count: 2,
      status: "OPEN",
      image_key: null,
      owner: { user_id: 2, name: "山田太郎", image_key: null },
      participants: [
        { user_id: 301, name: "ランナー1", bio: null, image_key: null },
        { user_id: 302, name: "ランナー2", bio: null, image_key: null },
      ],
      restrictions: { ageRange: null, scale: null, capacityText: "初心者OK", level: null },
    },
    {
      id: 3,
      title: "終了したイベント（一覧で伏せる用）",
      description: "include_closed を付けない一覧では出ません。",
      place: "オンライン",
      starts_at: iso(-10, 12, 0),
      capacity: 50,
      joined_count: 50,
      status: "CLOSED",
      image_key: null,
      owner: { user_id: 99, name: "過去幹事", image_key: null },
      participants: [],
    },
  ];
}

export function getSeedDetails(): EventDetail[] {
  return seedDetails();
}

export function detailToListItem(d: EventDetail): EventListItem {
  return {
    id: d.id,
    title: d.title,
    place: d.place,
    starts_at: d.starts_at,
    capacity: d.capacity,
    joined_count: d.joined_count,
    status: d.status,
    image_key: d.image_key,
    owner: d.owner,
    participants_preview: d.participants.length ? d.participants.slice(0, 4) : null,
  };
}
