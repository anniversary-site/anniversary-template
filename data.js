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

  // 바탕화면 아이콘 (type: information | folder | note | photobooth | paint | link | trash)
  icons: [
    { id: "information", label: "Our Story", icon: "assets/icons/our story.svg", type: "information" },
    { id: "letter", label: "Letter",   icon: "assets/icons/letter.svg", type: "note", ref: "letter" },
    { id: "photo",   label: "Photo",     icon: "assets/icons/photo.svg", type: "folder", ref: "photo" },
    { id: "video",   label: "Video",     icon: "assets/icons/video.svg", type: "folder", ref: "video" },
    { id: "record",  label: "Music",    icon: "assets/icons/music.svg", type: "folder", ref: "record" },
    { id: "booth",   label: "Photobooth",icon: "assets/icons/photo booth.svg", type: "photobooth" },
    { id: "game", label: "Game", icon: "assets/icons/game.svg", type: "folder", ref: "game" },
    { id: "paint",   label: "Paint",     icon: "assets/icons/paint.svg", type: "paint" },
    { id: "net",     label: "Internet",  icon: "assets/icons/internet.svg", type: "link", url: "https://urluv.shop/" },
    { id: "trash",   label: "Recycle Bin", icon: "assets/icons/recycle bin.svg", type: "trash" }
  ],

  // 기념일 정보
  information: {
    specialDate: "2026.12.21",
    specialPlace: "서강대학교 정문",
    story: "종강종강"
  },

  // 고객에게 받은 편지
  //  줄바꿈 = \n
  notes: {
    letter: {
      title: "Letter",
      text: "이 편지는 영국에서 최초로 시작되어"
    }
  },

  folders: {
    game: {
      title: "Game",
      files: [
        { name: "minesweeper", type: "game", ref: "minesweeper" }
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
      title: "Music",
      files: [
        { name: "서연의 목소리.mp3", type: "audio", src: "assets/record/seoyeon.mp3" },
        { name: "민준의 목소리.mp3", type: "audio", src: "assets/record/minjun.mp3" }
      ]
    }
  },

  // 제목, 가수, YouTube 링크를 tracks에 추가
  music: {
    title: "Our playlist",
    tracks: [
      { title: "Heavy Serenade", artist: "NMIXX", url: "https://www.youtube.com/embed/hGqYdubpcCM?si=0dZNiwTDXWKPli7O" },
      { title: "Unayaha ", artist: "CHIIKAWA", url: "https://www.youtube.com/watch?v=wFOjWCLPDDM" }
    ]
  },

  // 포토부스 프레임
  frames: [
    { id: "dear", label: "Dear", color: "#e8789a", deco: "♥" },
    { id: "dewy", label: "Dewy", color: "#7ec8a9", deco: "✿" }
  ],

  startMenu: "Dearest us"
};
