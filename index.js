li.addEventListener('click', () => {
    const objectUrl = URL.createObjectURL(file);
    document.getElementById('pdfFrame').src = objectUrl;
  });
  