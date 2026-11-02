// 이 파일만 수정하면 내용이 바뀝니다. (백엔드 없음)
// 사진/영상/음성은 assets/ 폴더에 넣고 src에 경로를 적으세요. 파일이 없거나 src가 비어 있으면 임시 이미지가 표시됩니다.
// 파일을 추가하려면 files 배열에 { name: "파일명.jpg", type: "image", src: "assets/photo/dear/파일명.jpg", caption: "설명" } 한 줄을 추가하세요.
window.SITE = {
  title: "Our Little Lab",
  // 입장 비밀번호는 평문 대신 SHA-256 해시로 저장합니다. (현재 비밀번호: 기념일 MMDD)
  // 바꾸는 법: 터미널에서  printf '%s' 'our-lab:새비밀번호' | shasum -a 256  결과를 아래에 붙여넣기 (salt와 같은 접두어 사용)
  passwordSalt: "our-lab:",
  passwordHash: "5b3020281247b63abe1dc850edde861a584ea32047e514b9e055f1dc081b296d",
  loginTitle: "Our Little Lab - Login",
  loginMessage: "우리의 시작을 날짜 네 자리로 입력해 주세요.\n(힌트: MMDD)",
  userName: "Dearest_us",
  startDate: "2023-06-18",     // 기념일 시작일 (D-day 계산)
  expiresOn: "2026-11-05",     // 사용 만료일(한국 날짜 기준) 
  renewalNoticeDays: 3,        // 만료 n일 전부터 알림 표시
  renewalUrl: "https://urluv.shop/",
  names: ["민준", "서연"],      // 이름 변경
  theme: { main: "#e8789a", dark: "#b8456b", light: "#ffeaf1", bg: "#f6a6c1" },

  // 바탕화면 아이콘 (type: folder | note | photobooth | paint | link | trash)
  icons: [
    { id: "story",   label: "Our Story", icon: "assets/icons/our story.svg", type: "note",  ref: "story" },
    { id: "letters", label: "Letters",   icon: "assets/icons/letter.svg", type: "folder", ref: "letters" },
    { id: "photo",   label: "Photo",     icon: "assets/icons/photo.svg", type: "folder", ref: "photo" },
    { id: "video",   label: "Video",     icon: "assets/icons/video.svg", type: "folder", ref: "video" },
    { id: "record",  label: "Record",    icon: "assets/icons/music.svg", type: "folder", ref: "record" },
    { id: "booth",   label: "Photobooth",icon: "assets/icons/photo booth.svg", type: "photobooth" },
    { id: "paint",   label: "Paint",     icon: "assets/icons/paint.svg", type: "paint" },
    { id: "net",     label: "Internet",  icon: "assets/icons/internet.svg", type: "link", url: "https://urluv.shop/" },
    { id: "trash",   label: "Recycle Bin", icon: "assets/icons/recycle bin.svg", type: "trash" }
  ],

  //name, text, caption 변경
  notes: {
    story: {
      title: "Our-Story.txt",
      text: "[우리의 이야기]\n\n< 2023년 6월 18일, 우리는 처음 만났어요. >\n그날 이후로 모든 날이 기념일이 되었습니다.\n\n< 이 컴퓨터에는 우리의 기록만 남아 있어요. >\n사진, 영상, 편지, 목소리. 천천히 열어 보세요.\n\n< 마지막으로 >\n앞으로도 같이, 오래오래.\n- 서연 & 민준"
    }
  },

  folders: {
    letters: {
      title: "Letters",
      files: [
        { name: "첫번째편지.txt", type: "text", text: "처음 만난 날 생각나?\n그때부터 지금까지, 매일이 선물이었어.\n\n사랑해. 앞으로도 잘 부탁해." },
        { name: "100일.txt", type: "text", text: "100일 축하해!\n작은 것들이 쌓여서 큰 마음이 되었어." },
        { name: "1주년.txt", type: "text", text: "1주년 기념 편지\n\n네 덕분에 한 해가 반짝였어." }
      ]
    },
    photo: {
      title: "Photo",
      files: [
        { name: "Dear", type: "folder", ref: "photo_dear" },
        { name: "Dewy", type: "folder", ref: "photo_dewy" }
      ]
    },
    photo_dear: {
      title: "Photo/Dear",
      files: [
        { name: "first-date.jpg", type: "image", src: "assets/photo/dear/first-date.jpg", caption: "첫 데이트" },
        { name: "cafe.jpg", type: "image", src: "assets/photo/dear/cafe.jpg", caption: "카페에서" },
        { name: "sunset.jpg", type: "image", src: "assets/photo/dear/sunset.jpg", caption: "노을" }
      ]
    },
    photo_dewy: {
      title: "Photo/Dewy",
      files: [
        { name: "trip.jpg", type: "image", src: "assets/photo/dewy/trip.jpg", caption: "여행" },
        { name: "picnic.jpg", type: "image", src: "assets/photo/dewy/picnic.jpg", caption: "소풍" }
      ]
    },
    video: {
      title: "Video",
      files: [
        { name: "01.mp4", type: "video", src: "assets/video/01.mp4", caption: "첫 번째 영상" },
        { name: "02.mp4", type: "video", src: "assets/video/02.mp4", caption: "두 번째 영상" }
      ]
    },
    record: {
      title: "Record",
      files: [
        { name: "서연의 목소리.mp3", type: "audio", src: "assets/record/seoyeon.mp3" },
        { name: "민준의 목소리.mp3", type: "audio", src: "assets/record/minjun.mp3" }
      ]
    }
  },

  // 포토부스 프레임
  frames: [
    { id: "dear", label: "Dear", color: "#e8789a", deco: "♥" },
    { id: "dewy", label: "Dewy", color: "#7ec8a9", deco: "✿" }
  ],

  startMenu: "Dearest us"
};
