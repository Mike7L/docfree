document.getElementById('folderInput').addEventListener('change', function(event) {
    const files = event.target.files;
    const fileListElement = document.getElementById('fileList');
    fileListElement.innerHTML = ''; // Clear any existing list
  
    // Convert FileList to an array and sort by name
    const fileArray = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
  
    fileArray.forEach(file => {
      // Filter to include only PDF files
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const li = document.createElement('li');
        // Display the relative path (or just the file name)
        li.textContent = file.webkitRelativePath || file.name;
  
        li.addEventListener('click', () => {
          // Create an object URL for the selected PDF file
          const objectUrl = URL.createObjectURL(file);
          // Set the iframe's src to display the PDF (using Chrome's built‑in PDF viewer)
          document.getElementById('pdfFrame').src = objectUrl;
        });
  
        fileListElement.appendChild(li);
      }
    });
  });
  