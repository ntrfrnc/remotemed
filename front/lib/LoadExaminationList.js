import DynamicSelectList from "./DynamicSelectList/DynamicSelectList";
import {postCommand} from "./Tools";

export default async function loadExaminationList({wrapper, userID, addNewForm}) {
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

  return new DynamicSelectList({
    wrapper: wrapper,
    items: list,
    clearBeforeApply: true,
    addNewForm: addNewForm
  });
}
