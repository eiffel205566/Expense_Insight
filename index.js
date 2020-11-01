let links = document.querySelectorAll('.hero ul a');

links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    
    document.querySelector(href).scrollIntoView({
      behavior:'smooth'
    })
  })
})

let navbar = document.querySelector('.navbar');

window.onscroll = () => {
  if (window.pageYOffset > 100){
    navbar.classList.remove('top')
  } else {
    navbar.classList.add('top')
  }
};

