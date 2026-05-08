const noticeDiv = document.getElementById("notices");

fetch("http://localhost:3000/notice/all")
    .then(res => res.json())
    .then(data => {
        if (data.length === 0) {
            noticeDiv.innerHTML = "<p>No notices available</p>";
            return;
        }

        data.forEach(n => {
            noticeDiv.innerHTML += `
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px">
          <h3>${n.title}</h3>
          <p>${n.description}</p>
          ${n.file_name ? `<a href="http://localhost:3000/uploads/${n.file_name}" target="_blank">View File</a>` : ""}
        </div>
      `;
        });
    });
