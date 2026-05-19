"use client"; // Obligatoire car Headless UI utilise des interactions côté client

import Link from 'next/link';
import Image from 'next/image'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Navbar() {
  const { isConnected, user, logout } = useAuth();

  return (
    // Disclosure est le composant magique qui gère l'état ouvert/fermé
    <Disclosure as="nav" className="relative bg-white shadow-md/20 shadow-night-blue p-4">
      {/* On récupère la variable "open" fournie par Disclosure pour changer l'icône */}
      {({ open }) => (
        <>
          <div className="flex items-center justify-between">
            
            {/* 1. GAUCHE : Menu Burger (Mobile) & Pages (Bureau) */}
            <div className="flex flex-1 justify-start">
              
              {/* Le bouton burger géré par Headless UI */}
              <div className="md:hidden">
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none">
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {/* Si ouvert : icône croix, Sinon : icône burger */}
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>

              {/* Liens bureau (Utilisation de next/link) */}
              <div className="hidden ml-5 md:flex items-center justify-center space-x-6">
                <Link href="/" className="font-text text-2xl text-gray-600 hover:text-black">Accueil</Link>
                <Link href="/services" className="font-text text-2xl text-gray-600 hover:text-black">La boutique</Link>
                <Link href="/about" className="font-text text-2xl text-gray-600 hover:text-black">Personnalisation</Link>
                <Link href="/about" className="font-text text-2xl text-gray-600  hover:text-black">À propos</Link>
              </div>
            </div>

            {/* 2. CENTRE : Le Logo */}
            <div className="flex flex-shrink-0 justify-center">
              <Link href="/" className="text-2xl tracking-widest text-indigo-600">
                  <Image src='/static/logo.png' width={150} height={150} alt="Logo de la marque Sac'Azura" />
              </Link>
            </div>

            {/* 3. DROITE : Connexion / Compte */}
            <div className="mr-5 flex flex-1 justify-end space-x-6">
              <ShoppingBagIcon className='w-auto h-8'/>
              <div className="hidden md:flex items-center space-x-4">
                {isConnected ? (
                  <Menu as="div" className="relative inline-block text-left">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-8 w-8 text-gray-600 mr-2" />
                      <MenuButton className="font-text text-2xl text-gray-600 hover:text-black">
                        Votre compte
                      </MenuButton>
                    </div>
                    <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="px-4 py-2 text-sm text-gray-700">
                        Connecté en tant que <br/>
                        <span className="font-medium">{user?.mail}</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <MenuItem>
                        {() => (
                          <button
                            onClick={logout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Se déconnecter
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                ) : (
                  <>
                    <Link href="/register" className="font-text text-2xl text-gray-600 text-gray-600 hover:text-black">
                      S'inscrire
                    </Link>
                    <Link href="/login" className="px-4 py-2 border-l-2 border-night-blue/50 font-text text-2xl text-gray-600">
                      Connexion
                    </Link>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* 4. LE MENU MOBILE (Déroulant) */}
          {/* DisclosurePanel gère automatiquement l'affichage basé sur l'état "open" */}
          <DisclosurePanel className="md:hidden absolute left-0 top-full w-full bg-white px-4 pt-2 pb-4 shadow-lg z-10">
            <div className="space-y-1">
              <DisclosureButton as={Link} href="/" className="block py-3 font-text text-2xl text-gray-600 hover:text-black">
                Accueil
              </DisclosureButton>
              <DisclosureButton as={Link} href="/services" className="block py-3 font-text text-2xl text-gray-600 hover:text-black">
                La boutique
              </DisclosureButton>
              <DisclosureButton as={Link} href="/services" className="block py-3 font-text text-2xl text-gray-600 hover:text-black">
                Personnalisation
              </DisclosureButton>
              <DisclosureButton as={Link} href="/about" className="block py-3 font-text text-2xl text-gray-600 hover:text-black">
                À propos
              </DisclosureButton>
            </div>
            
            <div className="mt-4 flex flex-col space-y-2">
              {isConnected && user.role ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-700">
                    Connecté en tant que <br/>
                    <span className="font-medium">{user?.mail}</span>
                  </div>
                  <DisclosureButton
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 font-text text-2xl text-gray-600 hover:text-black border-t-2 border-night-blue/50"
                  >
                    Se déconnecter
                  </DisclosureButton>
                </>
              ) : (
                <>
                  <DisclosureButton as={Link} href="/register" className="block py-2 text-center font-text text-2xl text-gray-600 hover:text-black">
                    S'inscrire
                  </DisclosureButton>
                  <DisclosureButton as={Link} href="/login" className="block py-2 text-center font-text text-2xl text-gray-600 hover:text-black border-t-2 border-night-blue/50 ">
                    Connexion
                  </DisclosureButton>
                </>
              )}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}