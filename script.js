class FloatingBall {
  constructor(containerWidth, containerHeight, options = {}) {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;

    this.element = document.createElement('div');
    this.element.className = 'floating-ball';

    const size = Math.random() * ((options.maxSize ?? 300) - (options.minSize ?? 150)) + (options.minSize ?? 150);
    this.element.style.width = `${size}px`;
    this.element.style.height = `${size}px`;

    this.x = Math.random() * (containerWidth - size);
    this.y = Math.random() * (containerHeight - size);

    this.speedX = (Math.random() - 0.5) * 1.5;
    this.speedY = (Math.random() - 0.5) * 1.5;

    const colors = [
      'rgba(200,100,255,0.5)',
      'rgba(255,100,100,0.5)',
      'rgba(100,255,180,0.5)'
    ];
    this.element.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    this.element.style.filter = `blur(${options.blur ?? '30px'})`;

    this.updatePosition();
  }

  updatePosition() {
    this.x += this.speedX;
    this.y += this.speedY;

    const ballWidth = this.element.offsetWidth;
    const ballHeight = this.element.offsetHeight;

    if (this.x < 0 || this.x + ballWidth > this.containerWidth) this.speedX *= -1;
    if (this.y < 0 || this.y + ballHeight > this.containerHeight) this.speedY *= -1;

    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }
}

class BallsBackground {
  constructor(container, options = {}) {
    this.container = container;
    this.balls = [];
    this.options = options;
    this.animate = this.animate.bind(this);
    this.init();
  }

  init() {
    if (!this.container) return;

    const style = this.container.style;
    style.position = style.position || 'relative';
    style.overflow = 'hidden';

    this.ballsWrapper = document.createElement('div');
    this.ballsWrapper.className = 'balls-wrapper';
    Object.assign(this.ballsWrapper.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '1920px',
      height: '100%',
      pointerEvents: 'none'
    });
    this.container.appendChild(this.ballsWrapper);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    for (let i = 0; i < (this.options.numBalls ?? 7); i++) {
      const ball = new FloatingBall(width, height, this.options);
      this.ballsWrapper.appendChild(ball.element);
      this.balls.push(ball);
    }

    this.animate();
  }

  animate() {
    this.balls.forEach(ball => ball.updatePosition());
    requestAnimationFrame(this.animate);
  }

  removeBall(ball) {
    this.ballsWrapper.removeChild(ball.element);
    this.balls = this.balls.filter(b => b !== ball);
  }

  addBall(ball) {
    this.ballsWrapper.appendChild(ball.element);
    this.balls.push(ball);
  }

  reset() {
    if (!this.ballsWrapper) return;
    this.ballsWrapper.innerHTML = '';
    this.balls = [];
    this.init();
  }
}

class MultiContainerBalls {
  constructor(containers, options = {}) {
    this.containers = containers;
    this.instances = containers.map(container => new BallsBackground(container, options));
    this.transferInterval = options.transferInterval ?? 5000;
    this.startTransferLoop();
  }

  startTransferLoop() {
    setInterval(() => {
      const fromIndex = Math.floor(Math.random() * this.instances.length);
      let toIndex = Math.floor(Math.random() * this.instances.length);
      while (toIndex === fromIndex) {
        toIndex = Math.floor(Math.random() * this.instances.length);
      }

      const fromInstance = this.instances[fromIndex];
      const toInstance = this.instances[toIndex];
      const ball = fromInstance.balls[Math.floor(Math.random() * fromInstance.balls.length)];

      if (ball) {
        fromInstance.removeBall(ball);
        toInstance.addBall(ball);
      }
    }, this.transferInterval);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const containers = [
    document.querySelector('.balls-container-hero'),
    document.querySelector('.balls-container-skills')
  ].filter(Boolean);

  new MultiContainerBalls(containers, {
    numBalls: 20,
    blur: '30px',
    maxSize: 250,
    minSize: 100,
    transferInterval: 7000
  });
});

window.addEventListener('resize', () => {
  // Tu peux ajouter une logique ici si tu veux réinitialiser les instances
});

function initializeFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Retirer la classe active de tous les boutons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Ajouter la classe active au bouton cliqué
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      // Filtrer les cartes
      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        // Ajouter/retirer la classe hidden avec un délai pour l'animation
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// Ajouter l'initialisation du filtre au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  // ... code existant ...
  initializeFilter();
});

function initTimeline() {
  const timeline = document.querySelector('.timeline');
  const progress = document.querySelector('.timeline-progress');
  const items = document.querySelectorAll('.timeline-item');
  let isScrolling = false;
  
  function updateTimeline() {
    const timelineRect = timeline.getBoundingClientRect();
    const timelineTop = timelineRect.top;
    const viewportCenter = window.innerHeight / 2;
    
    items.forEach((item, index) => {
      const dot = item.querySelector('.timeline-dot');
      const content = item.querySelector('.timeline-content');
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.top + itemRect.height / 2;
      const distanceFromCenter = Math.abs(itemCenter - viewportCenter);
      
      // Calculer la progression
      const progress = 1 - Math.min(Math.abs(distanceFromCenter) / (window.innerHeight / 2), 1);
      
      if (progress > 0.8) { // Item est proche du centre
        if (!isScrolling) {
          // Scroll snap vers l'item
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Animer le dot et le contenu
        dot.classList.add('active');
        content.classList.add('active');
        
        // Marquer comme complété si c'est au-dessus
        if (itemRect.top < viewportCenter) {
          dot.classList.add('completed');
          content.classList.add('completed');
          content.classList.remove('active');
        }
      } else {
        // Reset des états si trop loin du centre
        dot.classList.remove('active');
        content.classList.remove('active');
        
        if (itemRect.top > viewportCenter) {
          dot.classList.remove('completed');
          content.classList.remove('completed');
        }
      }
    });
    
    // Mettre à jour la barre de progression
    const progressPercentage = Math.min(
      100,
      Math.max(0, ((window.scrollY - timelineTop + viewportCenter) / timelineRect.height) * 100)
    );
    progress.style.height = `${progressPercentage}%`;
  }
  
  // Gestion du scroll avec debounce
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    
    requestAnimationFrame(updateTimeline);
    
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150);
  });
  
  // Update initial
  updateTimeline();
}

// Dans ton DOMContentLoaded, appelle initTimeline()
document.addEventListener('DOMContentLoaded', () => {
  initTimeline();
});

function initProductions() {
  const files = document.querySelectorAll('.file');
  let isScrolling = false;

  // Ajouter un index pour l'animation séquentielle
  files.forEach((file, index) => {
    file.style.setProperty('--file-index', index);
  });

  function handleScroll(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isScrolling) {
        entry.target.classList.add('preview-visible');
        
        // Scroll plus doux
        entry.target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center' 
        });
      } else {
        if (!entry.target.classList.contains('expanded')) {
          // Animation de fermeture plus douce
          setTimeout(() => {
            entry.target.classList.remove('preview-visible');
          }, 200);
        }
      }
    });
  }

  const observer = new IntersectionObserver(handleScroll, {
    threshold: 0.7,
    root: document.querySelector('.folder-content')
  });

  files.forEach(file => {
    observer.observe(file);

    file.addEventListener('click', () => {
      const wasExpanded = file.classList.contains('expanded');
      
      // Fermer les autres fichiers avec animation
      files.forEach(f => {
        if (f !== file) {
          f.classList.remove('expanded');
          const btn = f.querySelector('.expand-btn');
          btn.style.transform = 'rotate(0deg)';
          setTimeout(() => {
            btn.textContent = '+';
          }, 250);
        }
      });

      // Basculer l'état du fichier cliqué avec animation
      if (!wasExpanded) {
        file.classList.add('expanded');
        const btn = file.querySelector('.expand-btn');
        btn.style.transform = 'rotate(45deg)';
        setTimeout(() => {
          btn.textContent = '×';
        }, 250);
        
        // Scroll vers le fichier ouvert
        setTimeout(() => {
          file.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }, 100);
      } else {
        file.classList.remove('expanded');
        const btn = file.querySelector('.expand-btn');
        btn.style.transform = 'rotate(0deg)';
        setTimeout(() => {
          btn.textContent = '+';
        }, 250);
      }
    });
  });

  // Optimisation du scroll
  const folderContent = document.querySelector('.folder-content');
  let scrollTimeout;

  folderContent.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150);
  });
}

// Ajouter à votre DOMContentLoaded existant
document.addEventListener('DOMContentLoaded', () => {
  // ...existing code...
  initProductions();
});
