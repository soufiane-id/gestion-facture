import { store } from "./store/store";
import { EcransEnum } from "./_helpers/ecranEnum";


export const navigationService = {
    buildNavTree,
};

async function buildNavTree() {
    return [
        {
            name: "Accueil",
            url: "/accueil",
            icon: "icon-speedometer",
            badge: {
                variant: "danger",
                text: "NEW",
            },
            attributes: {
                hidden: !hasRights(EcransEnum.ACCUEIL)
            },
        },
        {
            name: "Dashboard",
            url: "/dashboard",
            icon: "icon-speedometer",
            badge: {
                variant: "primary",
                text: "NEW",
            },
            attributes: {
                hidden: !hasRights(EcransEnum.DASHBOARD)
            },
        },
        {
            title: true,
            name: "Tableau de bord",
            class: "",
            wrapper: {
                element: "",
                attributes: {},
            },
        },
        {
            name: "Suivi Client",
            url: "/tdb/suiviClient",
            icon: "icon-speedometer",
            attributes: {
                hidden: !hasRights(EcransEnum.SUIVI_CLIENT)
            },
        },
        {
            title: true,
            name: "Intégration",
            class: "",
            wrapper: {
                element: "",
                attributes: {},
            },
        },
        {
            name: "Intégrer Opération",
            url: "/integration/operations",
            icon: "icon-drop",
            attributes: {
                hidden: !hasRights(EcransEnum.INTEGRATION_OPERATIONS)
            },
        },
        {
            name: "Intégrer Echéance",
            url: "/integration/echeances",
            icon: "icon-pencil",
            attributes: {
                hidden: !hasRights(EcransEnum.INTEGRATION_ECHEANCES)
            },
        },
        {
            title: true,
            name: "Components",
            class: "",
            wrapper: {
                element: "",
                attributes: {},
            },
        },
        {
            name: "EnCours",
            url: "/encours",
            icon: "icon-puzzle",
            children: [
                {
                    name: "Encours Client",
                    url: "/encours/Client",
                    icon: "icon-puzzle",
                    attributes: {
                        hidden: !hasRights(EcransEnum.ENCOURS_CLIENT)
                    },
                },
                {
                    name: "Encours Fournisseur",
                    url: "/encours/Fournisseur",
                    icon: "icon-puzzle",
                    attributes: {
                        hidden: !hasRights(EcransEnum.ENCOURS_FOURNISSEUR)
                    },
                },
            ],
        },
        {
            name: "Banque",
            url: "/banque",
            icon: "icon-eur",
            children: [
                {
                    name: "Liste opérations",
                    url: "/banque/banques",
                    icon: "icon-usd",
                    attributes: {
                        hidden: !hasRights(EcransEnum.LISTE_OPERATIONS)
                    },
                },
                {
                    name: "Etat de la banque",
                    url: "/banque/etatBanque",
                    icon: "icon-usd",
                    attributes: {
                        hidden: !hasRights(EcransEnum.ETAT_BANQUE)
                    },
                },
            ],
        },
        {
            name: "Partenaires",
            url: "/partenaires",
            icon: "icon-puzzle",
            children: [
                {
                    name: "Liste Clients",
                    url: "/partenaires/clients",
                    icon: "icon-puzzle",
                    attributes: {
                        hidden: !hasRights(EcransEnum.LISTE_CLIENT)
                    },
                },
                {
                    name: "Liste Fournisseurs",
                    url: "/partenaires/fournisseurs",
                    icon: "icon-puzzle",
                    attributes: {
                        hidden: !hasRights(EcransEnum.LISTE_FOURNISSEUR)
                    },
                },
            ],
        },
        {
            title: true,
            name: "Administration",
            class: "",
            wrapper: {
                element: "",
                attributes: {},
            },
        },
        {
            name: "Gestion Utilisateurs",
            url: "/administration/utilisateurs",
            icon: "icon-speedometer",
            attributes: {
                hidden: !hasRights(EcransEnum.GESTION_UTILISATEURS)
            },
        },
        {
            name: "Gestion Roles",
            url: "/administration/roles",
            icon: "icon-speedometer",
            attributes: {
                hidden: !hasRights(EcransEnum.GESTION_ROLES)
            },
        },
        {
            divider: true,
        },
    ];
}

function hasRights(ecranName) {
    return store.state.auth.ecransAutorises.includes(ecranName) ? true : false;
}