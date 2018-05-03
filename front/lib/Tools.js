export async function postCommand({url, command, data, isBinary}) {
  data = data || {};

  const response = await fetch(url, {
    method: "POST",
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    credentials: "include",
    body: JSON.stringify(Object.assign({
      command: command
    }, data))
  });

  if (isBinary) {
    return await response.arrayBuffer();
  } else {
    return await response.json();
  }
}
