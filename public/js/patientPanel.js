(function () {
  async function onDoctorChange(e) {
    const select = e.target;
    select.disabled = true;
    const doctorID = select.options[select.selectedIndex].value;

    try {
      await fetch(window.location, {
        method: "POST",
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        credentials: "include",
        body: JSON.stringify({
          command: 'setDoctorForPatient',
          doctorID: doctorID
        })
      });
    } catch (e) {
      alert(e.message);
    }

    select.disabled = false;
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Handle doctor change
    const doctorSelect = document.getElementById('doctorSelect');
    doctorSelect.addEventListener('change', onDoctorChange);


  });
})();