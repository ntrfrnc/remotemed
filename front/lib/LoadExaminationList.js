import {postCommand} from "./Tools";

export default async function loadExaminationList(userID) {
  const query = {
    url: window.location.toString(),
    command: 'getExaminations'
  };
  if (userID) {
    query.data = {userID};
  }

  const data = await postCommand(query);
  if (!data) {
    return;
  }

  const list = [];
  for (let item of data) {
    list.push({
      content: item.name + ' - ' + (new Date(item.date)).toLocaleString(),
      data: item
    });
  }

  return list;
}
