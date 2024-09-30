const badWords = [
  "hate",
  "stupid",
  "dumb",
  "idiot",
  "loser",
  "fail",
  "suck",
  "crap",
  "shut up",
  "go away",
  "spam",
  "scam",
  "fake",
  "liars",
  "threat",
  "harassment",
  "abuse",
  "đồ ngu",
  "đồ điên",
  "đồ loser",
  "chẳng ra gì",
  "thất bại",
  "tệ quá",
  "khốn nạn",
];

exports.checkBadWord = (comment) => {
  const words = comment.toLowerCase().split(" ");
  return words.some((word) => badWords.includes(word));
};
