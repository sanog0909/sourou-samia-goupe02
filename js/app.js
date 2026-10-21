/* ============================================================
   SOUROU SAMIA — Logique JavaScript
   Coopérative Céréalière du Sourou · Burkina Faso
   ------------------------------------------------------------
   Modules :
   1. Panier (ajout, retrait, total, persistance)
   2. Menu mobile
   3. Filtres du catalogue
   4. Validation du formulaire
   5. Animations au scroll
   6. Bouton retour en haut
   7. Notifications toast
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. PANIER
     ============================================================ */
  const CART_KEY = 'sourou-samia-panier';

  const Panier = {
    // Lire le panier depuis localStorage
    lire() {
      try {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.warn('Panier illisible :', e);
        return [];
      }
    },

    // Sauvegarder le panier
    sauvegarder(items) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        this.mettreAJourBadge();
        this.afficherDansPage();
      } catch (e) {
        console.warn('Impossible de sauvegarder le panier :', e);
      }
    },

    // Ajouter un produit
    ajouter(produit) {
      const items = this.lire();
      const existant = items.find(i => i.id === produit.id);
      if (existant) {
        existant.quantite += produit.quantite;
      } else {
        items.push(produit);
      }
      this.sauvegarder(items);
      this.notifier(`${produit.nom} ajouté au panier`);
    },

    // Retirer un produit
    retirer(id) {
      const items = this.lire().filter(i => i.id !== id);
      this.sauvegarder(items);
    },

    // Vider le panier
    vider() {
      this.sauvegarder([]);
    },

    // Nombre total d'articles
    nombre() {
      return this.lire().reduce((total, i) => total + i.quantite, 0);
    },

    // Total en FCFA
    total() {
      return this.lire().reduce((total, i) => total + i.prix * i.quantite, 0);
    },

    // Mettre à jour le badge dans le header
    mettreAJourBadge() {
      const badges = document.querySelectorAll('[data-cart-count]');
      const n = this.nombre();
      badges.forEach(b => {
        b.textContent = n;
        b.hidden = n === 0;
      });
    },

    // Afficher le panier dans la page (si on est sur acheteurs.html)
    afficherDansPage() {
      const conteneur = document.getElementById('panier-contenu');
      if (!conteneur) return;

      const items = this.lire();

      if (items.length === 0) {
        conteneur.innerHTML = `
          <p class="panier-vide">
            Votre panier est vide. Parcourez
            <a href="produits.html">le catalogue</a> pour ajouter des céréales.
          </p>`;
        return;
      }

      const lignes = items.map(item => `
        <tr>
          <td>
            <strong>${item.nom}</strong>
            <small>${item.grade || 'Grade A/B/C'} · ${item.recolte || 'Nov. 2025'}</small>
          </td>
          <td>${item.prix} FCFA/kg</td>
          <td>
            <input type="number" class="panier-quantite"
                   data-id="${item.id}"
                   value="${item.quantite}" min="1" step="1">
            <span class="panier-unite">kg</span>
          </td>
          <td><strong>${(item.prix * item.quantite).toLocaleString('fr-FR')} FCFA</strong></td>
          <td>
            <button type="button" class="panier-retirer"
                    data-id="${item.id}"
                    aria-label="Retirer ${item.nom} du panier">✕</button>
          </td>
        </tr>
      `).join('');

      conteneur.innerHTML = `
        <table class="panier-table">
          <thead>
            <tr>
              <th>Céréale</th>
              <th>Prix unitaire</th>
              <th>Quantité</th>
              <th>Sous-total</th>
              <th><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>${lignes}</tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Total panier</strong></td>
              <td colspan="2"><strong>${this.total().toLocaleString('fr-FR')} FCFA</strong></td>
            </tr>
          </tfoot>
        </table>
        <div class="panier-actions">
          <a class="button button-green" href="#rendez-vous">
            Envoyer la demande <span aria-hidden="true">→</span>
          </a>
          <button type="button" class="panier-vider" id="panier-vider">
            Vider le panier
          </button>
        </div>
      `;

      // Écouter les changements de quantité
      conteneur.querySelectorAll('.panier-quantite').forEach(input => {
        input.addEventListener('change', (e) => {
          const id = e.target.dataset.id;
          const quantite = Math.max(1, parseInt(e.target.value, 10) || 1);
          const items = Panier.lire();
          const item = items.find(i => i.id === id);
          if (item) {
            item.quantite = quantite;
            Panier.sauvegarder(items);
          }
        });
      });

      // Écouter les boutons retirer
      conteneur.querySelectorAll('.panier-retirer').forEach(btn => {
        btn.addEventListener('click', () => {
          Panier.retirer(btn.dataset.id);
        });
      });

      // Bouton vider
      const vider = document.getElementById('panier-vider');
      if (vider) {
        vider.addEventListener('click', () => {
          if (confirm('Vider tout le panier ?')) {
            Panier.vider();
          }
        });
      }
    },

    // Notification toast
    notifier(message) {
      let toast = document.getElementById('toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.classList.add('toast-visible');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => {
        toast.classList.remove('toast-visible');
      }, 2500);
    }
  };

  window.Panier = Panier;

  /* ============================================================
     FAVORIS — distincts du panier, conservés sur cet appareil
     ============================================================ */
  const FAVORITES_KEY = 'sourou-samia-favoris';
  const Favoris = {
    lire() {
      try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); }
      catch (e) { return []; }
    },
    sauvegarder(items) {
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(items)); }
      catch (e) { console.warn('Impossible de sauvegarder les favoris :', e); }
      this.afficher();
      this.actualiserBoutons();
    },
    basculer(produit) {
      const items = this.lire();
      const index = items.findIndex(item => item.id === produit.id);
      if (index >= 0) { items.splice(index, 1); Panier.notifier(`${produit.nom} retiré des favoris`); }
      else { items.push(produit); Panier.notifier(`${produit.nom} ajouté aux favoris`); }
      this.sauvegarder(items);
    },
    actualiserBoutons() {
      const ids = new Set(this.lire().map(item => item.id));
      document.querySelectorAll('[data-favourite]').forEach(btn => {
        const card = btn.closest('[data-produit]');
        if (!card) return;
        const actif = ids.has(card.dataset.produit);
        btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
        btn.classList.toggle('is-favourite', actif);
        btn.innerHTML = `<span aria-hidden="true">${actif ? '♥' : '♡'}</span> ${actif ? 'Dans les favoris' : 'Ajouter aux favoris'}`;
      });
    },
    afficher() {
      const target = document.getElementById('favorites-list');
      if (!target) return;
      const items = this.lire();
      if (!items.length) {
        target.innerHTML = '<p class="favorites-empty">Aucun favori enregistré. Ajoutez une céréale depuis le catalogue avec le bouton cœur.</p>';
        return;
      }
      target.innerHTML = items.map(item => `<article class="favorite-item"><div><strong>${item.nom}</strong><span>${item.prix} FCFA/kg · ${item.grade || 'Grade A/B/C'}</span></div><button type="button" class="favorite-remove" data-favorite-remove="${item.id}">Retirer</button><a class="text-link" href="produits.html#${item.id}">Voir le produit →</a></article>`).join('');
      target.querySelectorAll('[data-favorite-remove]').forEach(btn => btn.addEventListener('click', () => {
        this.sauvegarder(this.lire().filter(item => item.id !== btn.dataset.favoriteRemove));
      }));
    }
  };

  /* ============================================================
     2. INITIALISATION
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {

    /* --- 2.1 Badge du panier --- */
    Panier.mettreAJourBadge();

    /* --- 2.2 Affichage du panier (si sur la page acheteurs) --- */
    Panier.afficherDansPage();
    Favoris.afficher();
    Favoris.actualiserBoutons();
    document.querySelectorAll('[data-favourite]').forEach(btn => btn.addEventListener('click', () => {
      const card = btn.closest('[data-produit]');
      if (!card) return;
      Favoris.basculer({ id: card.dataset.produit, nom: card.dataset.nom, prix: parseInt(card.dataset.prix, 10), grade: card.dataset.grade || 'Grade A/B/C', recolte: card.dataset.recolte || '' });
    }));

    /* --- 2.3 Boutons "Ajouter au panier" (sur produits.html) --- */
    document.querySelectorAll('[data-ajouter-panier]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('[data-produit]');
        if (!card) return;
        const produit = {
          id: card.dataset.produit,
          nom: card.dataset.nom,
          prix: parseInt(card.dataset.prix, 10),
          quantite: parseInt(card.dataset.quantiteDefaut || '1000', 10),
          grade: card.dataset.grade || 'Grade A/B/C',
          recolte: card.dataset.recolte || 'Nov. 2025'
        };
        Panier.ajouter(produit);
      });
    });

    /* --- 2.4 Menu mobile --- */
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('navigation-principale');
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        const ouvert = mainNav.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      });
    }

    /* --- 2.5 Catalogue : filtres, recherche et tri --- */
    const catalogue = document.querySelector('.product-list');
    const filtres = document.querySelectorAll('[data-filtre]');
    const recherche = document.getElementById('catalogue-search');
    const tri = document.getElementById('catalogue-sort');
    const cartes = catalogue ? Array.from(catalogue.querySelectorAll('[data-categorie]')) : [];
    let categorieActive = 'tout';
    const appliquerCatalogue = () => {
      const terme = (recherche?.value || '').trim().toLocaleLowerCase('fr');
      cartes.forEach(card => {
        const texte = `${card.dataset.nom || ''} ${card.textContent}`.toLocaleLowerCase('fr');
        card.hidden = !( (categorieActive === 'tout' || card.dataset.categorie === categorieActive) && texte.includes(terme) );
      });
      if (catalogue && tri) {
        const mode = tri.value;
        const visibles = cartes.slice().sort((a,b) => {
          if (mode === 'price-asc') return Number(a.dataset.prix)-Number(b.dataset.prix);
          if (mode === 'price-desc') return Number(b.dataset.prix)-Number(a.dataset.prix);
          if (mode === 'name') return (a.dataset.nom || '').localeCompare(b.dataset.nom || '', 'fr');
          if (mode === 'quantity-desc') return Number(b.querySelector('.product-specs dd')?.textContent.replace(/[^0-9]/g, '') || 0)-Number(a.querySelector('.product-specs dd')?.textContent.replace(/[^0-9]/g, '') || 0);
          return cartes.indexOf(a)-cartes.indexOf(b);
        });
        visibles.forEach(card => catalogue.appendChild(card));
      }
    };
    filtres.forEach(btn => btn.addEventListener('click', () => {
      categorieActive = btn.dataset.filtre;
      filtres.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      appliquerCatalogue();
    }));
    if (recherche) recherche.addEventListener('input', appliquerCatalogue);
    if (tri) tri.addEventListener('change', appliquerCatalogue);

    /* --- 2.6 Validation du formulaire de rendez-vous --- */
    const form = document.querySelector('.booking-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        const date = form.querySelector('#appointment-date');
        const quantite = form.querySelector('#appointment-quantity');
        const type = form.querySelector('#visit-type');
        const nom = form.querySelector('#appointment-name');
        let erreurs = [];

        if (!nom.value.trim()) erreurs.push('Le nom ou l\'entreprise est requis.');
        if (!date.value) erreurs.push('La date souhaitée est requise.');
        else {
          const d = new Date(date.value);
          const aujourdhui = new Date();
          aujourdhui.setHours(0, 0, 0, 0);
          if (d < aujourdhui) erreurs.push('La date doit être dans le futur.');
        }
        if (!type.value) erreurs.push('Le type de visite est requis.');
        if (!quantite.value || parseInt(quantite.value, 10) < 1) {
          erreurs.push('La quantité doit être supérieure à 0.');
        }

        if (erreurs.length > 0) {
          e.preventDefault();
          alert('Merci de corriger :\n\n' + erreurs.join('\n'));
        }
      });
    }

    /* --- 2.7 Animations au scroll --- */
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    }

    /* --- 2.8 Bouton retour en haut --- */
    const retourHaut = document.createElement('button');
    retourHaut.type = 'button';
    retourHaut.className = 'retour-haut';
    retourHaut.setAttribute('aria-label', 'Retour en haut de la page');
    retourHaut.innerHTML = '↑';
    document.body.appendChild(retourHaut);

    window.addEventListener('scroll', () => {
      retourHaut.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    retourHaut.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

  });
})();