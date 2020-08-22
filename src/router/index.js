import Vue from "vue";
import Router from "vue-router";
import { store } from "../store/store";
import { EcransEnum } from "../_helpers/ecranEnum";
import http from "../client/http-common";
import { authenticationService } from "../_services/authentication.service";

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

// Views - En Cours
const EcheancierClientView = () => import("@/views/encours/client/EcheancierClientView");

// Views - Banque
const BanqueOverview = () => import("@/views/banque/BanqueOverview");
const EtatBanque = () => import("@/views/banque/EtatBanque");

// Views - Partenaires
const ClientsView = () => import("@/views/partenaires/ClientsView");
const FournisseursView = () => import("@/views/partenaires/FournisseursView");

// Views - Administration
const GestionUtilisateur = () => import("@/views/administration/GestionUtilisateur");
const GestionRole = () => import("@/views/administration/GestionRole");

// Views - Login
const LoginPage = () => import("@/views/pages/account/Login");
const RegisterPage = () => import("@/views/pages/account/Register");

const page403 = () => import("@/views/pages/account/403");

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
          meta: { ecran: EcransEnum.ACCUEIL }
        },
        {
          path: "dashboard",
          name: "Dashboard",
          component: Dashboard,
          meta: { ecran: EcransEnum.DASHBOARD }
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
              meta: { ecran: EcransEnum.SUIVI_CLIENT }
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
              meta: { ecran: EcransEnum.INTEGRATION_OPERATIONS }
            },
            {
              path: "echeances",
              name: "Échéances",
              component: IntegrationEcheances,
              meta: { ecran: EcransEnum.INTEGRATION_ECHEANCES }
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
              meta: { ecran: EcransEnum.ENCOURS_CLIENT }
            },
            {
              path: ":routeTypePersonne",
              name: "Encours Fournisseur",
              component: EcheancierClientView,
              meta: { ecran: EcransEnum.ENCOURS_FOURNISSEUR }
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
              meta: { ecran: EcransEnum.LISTE_OPERATIONS }
            },
            {
              path: "etatBanque",
              name: "Etat Banque",
              component: EtatBanque,
              meta: { ecran: EcransEnum.ETAT_BANQUE }
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
              meta: { ecran: EcransEnum.LISTE_CLIENT }
            },
            {
              path: "fournisseurs",
              name: "FournisseurList",
              component: FournisseursView,
              meta: { ecran: EcransEnum.LISTE_FOURNISSEUR }
            },
          ],
        },
        {
          path: "administration",
          redirect: "/administration/utilisateurs",
          name: "Administration",
          component: {
            render(c) {
              return c("router-view");
            },
          },
          children: [
            {
              path: "utilisateurs",
              name: "Gestion Utilisateurs",
              component: GestionUtilisateur,
              meta: { ecran: EcransEnum.GESTION_UTILISATEURS }
            },
            {
              path: "roles",
              name: "Gestion Roles",
              component: GestionRole,
              meta: { ecran: EcransEnum.GESTION_ROLES }
            },
          ],
        }
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
    {
      path: "/",
      redirect: "/403",
      name: "page403",
      component: {
        render(c) {
          return c("router-view");
        },
      },
      children: [
        {
          path: "403",
          name: "403",
          component: page403,
        }
      ],
    }
  ],
});
export default router

router.beforeEach(async (to, from, next) => {
  const publicPages = ['/login', '/register', '/home', '/403', '/accueil'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = JSON.parse(localStorage.getItem('userInfo'));
  //On recupere les roles
  if (loggedIn && store.state.auth.ecransAutorises.length < 1) {
    await authenticationService.getRoleByName(store.state.auth.roleName);
  }
  const hasRight = store.state.auth.ecransAutorises.includes(to.meta.ecran)
  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !loggedIn) {
    next('/login');
  } else if (!hasRight && authRequired) {
    next('/403')
  } else {
    next();
  }
});