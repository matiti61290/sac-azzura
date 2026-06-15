"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingBagIcon, UserCircleIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Navbar() {
  const { isConnected, user, logout } = useAuth();

  return (
    <Disclosure as="nav" className="relative bg-white shadow-md/20 shadow-night-blue p-4">
      {({ open }) => (
        <>
          <div className="flex items-center justify-between">
            
            {/* 1. GAUCHE : Menu Burger (Mobile) & Pages (Bureau) */}
            <div className="flex flex-1 justify-start">
              <div className="md:hidden">
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none">
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>

              <div className="hidden ml-5 md:flex items-center justify-center space-x-6">
                <Link href="/" className="font-text text-2xl text-gray-600 hover:text-black">Accueil</Link>
                <Link href="/product-list" className="font-text text-2xl text-gray-600 hover:text-black">La boutique</Link>
                <Link href="/about" className="font-text text-2xl text-gray-600 hover:text-black">Personnalisation</Link>
                <Link href="/about" className="font-text text-2xl text-gray-600 hover:text-black">À propos</Link>
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
                
                {/* --- DÉBUT DES CONDITIONS BUREAU --- */}
                {isConnected ? (
                  user?.isAdmin ? (
                    /* CAS 1 : CONNECTÉ ET ADMIN */
                    <div className="flex items-center space-x-4">
                      <Link href="/dashboard" className="flex items-center hover:text-indigo-800 font-text text-2xl">
                        <Cog8ToothIcon className="h-6 w-6 mr-1" />
                        Dashboard
                      </Link>
                      <button onClick={logout} className="px-4 py-2 border-l-2 border-night-blue/50 font-text text-2xl text-gray-600 hover:text-black">
                        Déconnexion
                      </button>
                    </div>
                  ) : (
                    /* CAS 2 : CONNECTÉ MAIS UTILISATEUR NORMAL */
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
                          <span className="font-medium">{user?.firstname}</span>
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
                  )
                ) : (
                  /* CAS 3 : NON CONNECTÉ (VISITEUR) */
                  <>
                    <Link href="/register" className="font-text text-2xl text-gray-600 hover:text-black">
                      S'inscrire
                    </Link>
                    <Link href="/login" className="px-4 py-2 border-l-2 border-night-blue/50 font-text text-2xl text-gray-600 hover:text-black">
                      Connexion
                    </Link>
                  </>
                )}
                {/* --- FIN DES CONDITIONS BUREAU --- */}

              </div>
            </div>

          </div>

          {/* 4. LE MENU MOBILE (Déroulant) */}
          <DisclosurePanel className="md:hidden absolute left-0 top-full w-full bg-white px-4 pt-2 pb-4 shadow-lg z-10">
            <div className="space-y-1">
              <DisclosureButton as={Link} href="/" className="block py-3 font-text text-2xl text-gray-600 hover:text-black">Accueil</DisclosureButton>
              <DisclosureButton as={Link} href="/services" className="block py-3 font-text text-2xl text-gray-600 hover:text-black">La boutique</DisclosureButton>
              <DisclosureButton as={Link} href="/services" className="block py-3 font-text text-2xl text-gray-600 hover:text-black">Personnalisation</DisclosureButton>
              <DisclosureButton as={Link} href="/about" className="block py-3 font-text text-2xl text-gray-600 hover:text-black">À propos</DisclosureButton>
            </div>
            
            <div className="mt-4 flex flex-col space-y-2">
              
              {/* --- DÉBUT DES CONDITIONS MOBILE --- */}
              {isConnected ? (
                user?.isAdmin ? (
                   /* CAS 1 : CONNECTÉ ET ADMIN (Mobile) */
                   <>
                     <DisclosureButton as={Link} href="/dashboard" className="block py-2 text-center font-text text-2xl text-indigo-600 font-bold hover:text-indigo-800 border-t-2 border-night-blue/50">
                       Accéder au Dashboard
                     </DisclosureButton>
                     <DisclosureButton onClick={logout} className="block w-full text-center py-2 font-text text-2xl text-gray-600 hover:text-black border-t-2 border-night-blue/50">
                       Se déconnecter
                     </DisclosureButton>
                   </>
                ) : (
                  /* CAS 2 : CONNECTÉ MAIS UTILISATEUR NORMAL (Mobile) */
                  <>
                    <div className="px-4 py-2 text-center text-sm text-gray-700 border-t-2 border-night-blue/50 pt-4">
                      Connecté en tant que <br/>
                      <span className="font-medium">{user?.mail}</span>
                    </div>
                    <DisclosureButton
                      onClick={logout}
                      className="block w-full text-center py-2 font-text text-2xl text-gray-600 hover:text-black border-t-2 border-night-blue/50"
                    >
                      Se déconnecter
                    </DisclosureButton>
                  </>
                )
              ) : (
                /* CAS 3 : NON CONNECTÉ (VISITEUR) (Mobile) */
                <>
                  <DisclosureButton as={Link} href="/register" className="block py-2 text-center font-text text-2xl text-gray-600 hover:text-black border-t-2 border-night-blue/50 pt-4">
                    S'inscrire
                  </DisclosureButton>
                  <DisclosureButton as={Link} href="/login" className="block py-2 text-center font-text text-2xl text-gray-600 hover:text-black border-t-2 border-night-blue/50">
                    Connexion
                  </DisclosureButton>
                </>
              )}
              {/* --- FIN DES CONDITIONS MOBILE --- */}

            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}