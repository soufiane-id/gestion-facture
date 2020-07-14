import Vue from "vue";
import Router from "vue-router";

// Containers
const DefaultContainer = () => import("@/containers/DefaultContainer");

// Views
const Dashboard = () => import("@/views/Dashboard");

//Accueil
const Accueil = () => import("@/views/accueil/Accueil");

// Tableau de bord
const SuiviClient = () => import("@/views/tableauDeBord/SuiviClient");

// Views - Integration
const IntegrationOperations = () =>
  import("@/views/integration/IntegrationOperation");
const IntegrationEcheances = () =>
  import("@/views/integration/IntegrationEcheance");

// Views - Banque
const BanqueOverview = () => import("@/views/banque/BanqueOverview");
const EtatBanque = () => import("@/views/banque/EtatBanque");
const ClientsView = () => import("@/views/partenaires/ClientsView");
const FournisseursView = () => import("@/views/partenaires/FournisseursView");
const EcheancierClientView = () =>
  import("@/views/encours/client/EcheancierClientView");

// Views - Login
const LoginPage = () => import("@/views/pages/account/Login");
const RegisterPage = () => import("@/views/pages/account/Register");

Vue.use(Router);

const router = new Router({
  mode: "history", // https://router.vuejs.org/api/#mode
  linkActiveClass: "open active",
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: "/",
      redirect: "/accueil",
      name: "Home",
      component: DefaultContainer,
      children: [
        {
          path: "accueil",
          name: "Accueil",
          component: Accueil,
        },
        {
          path: "dashboard",
          name: "Dashboard",
          component: Dashboard,
        },
        {
          path: "tdb",
          redirect: "/tdb/suiviClient",
          name: "Tableau de Bord",
          component: {
            render(c) {
              return c("router-view");
            },
          },
          children: [
            {
              path: "suiviClient",
              name: "Suivi des Clients",
              component: SuiviClient,
            },
          ],
        },
        {
          path: "integration",
          redirect: "/integration/operations",
          name: "Intégration",
          component: {
            render(c) {
              return c("router-view");
            },
          },
          children: [
            {
              path: "operations",
              name: "Opérations",
              component: IntegrationOperations,
            },
            {
              path: "echeances",
              name: "Échéances",
              component: IntegrationEcheances,
            },
          ],
        },
        {
          path: "encours",
          redirect: "/encours/Client",
          name: "Encours",
          component: {
            render(c) {
              return c("router-view");
            },
          },
          children: [
            {
              path: ":routeTypePersonne",
              name: "Encours Client",
              component: EcheancierClientView,
            },
            {
              path: ":routeTypePersonne",
              name: "Encours Fournisseur",
              component: EcheancierClientView,
            },
          ],
        },
        {
          path: "banque",
          redirect: "/banque/banques",
          name: "Banque",
          component: {
            render(c) {
              return c("router-view");
            },
          },
          children: [
            {
              path: "banques",
              name: "BanqueList",
              component: BanqueOverview,
            },
            {
              path: "etatBanque",
              name: "Etat Banque",
              component: EtatBanque,
            },
          ],
        },
        {
          path: "partenaires",
          redirect: "/partenaires/clients",
          name: "Partenaires",
          component: {
            render(c) {
              return c("router-view");
            },
          },
          children: [
            {
              path: "clients",
              name: "ClientList",
              component: ClientsView,
            },
            {
              path: "fournisseurs",
              name: "FournisseurList",
              component: FournisseursView,
            },
          ],
        },
      ],
    },
    {
      path: "/",
      redirect: "/login",
      name: "Acc",
      component: {
        render(c) {
          return c("router-view");
        },
      },
      children: [
        {
          path: "login",
          name: "Login",
          component: LoginPage,
        },
        {
          path: "register",
          name: "Register",
          component: RegisterPage,
        },
      ],
    },
  ],
});
export default router

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register', '/home'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = JSON.parse(localStorage.getItem('userInfo'));

  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !loggedIn) {
    next('/login');
  } else {
    next();
  }
});
