'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';

interface KeycloakContextType {
  keycloak: Keycloak | null;
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  } | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  token: string | null;
  isLoading: boolean;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export function KeycloakProvider({ children }: { children: React.ReactNode }) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const kc = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
    });

    kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : undefined,
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })
      .then((auth) => {
        setKeycloak(kc);
        setAuthenticated(auth);
        setIsLoading(false);

        if (auth && kc.tokenParsed) {
          setUser({
            id: kc.tokenParsed.sub!,
            email: kc.tokenParsed.email || '',
            name: kc.tokenParsed.name || kc.tokenParsed.preferred_username || '',
            roles: kc.tokenParsed.realm_access?.roles || [],
          });
          setToken(kc.token!);
        }

        // Auto-refresh token
        const refreshInterval = setInterval(() => {
          kc.updateToken(70)
            .then((refreshed) => {
              if (refreshed && kc.token) {
                setToken(kc.token);
                console.log('Token refreshed');
              }
            })
            .catch(() => {
              console.error('Failed to refresh token');
              kc.logout();
            });
        }, 60000); // Check every 60 seconds

        // Cleanup interval on unmount
        return () => clearInterval(refreshInterval);
      })
      .catch((err) => {
        console.error('Keycloak initialization failed', err);
        setIsLoading(false);
      });
  }, []);

  const login = () => {
    keycloak?.login();
  };

  const logout = () => {
    keycloak?.logout({
      redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
    });
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        authenticated,
        user,
        login,
        logout,
        hasRole,
        token,
        isLoading,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloak() {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error('useKeycloak must be used within KeycloakProvider');
  }
  return context;
}
