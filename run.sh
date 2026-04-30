# infisical run --env dev --projectId d78f7abc-4b68-42d0-a613-5a5e48a7a1a0 -c 'bun dev'

INFISICAL_DOMAIN=https://infisical.codestore.dev
INFISICAL_PROJECT_ID=d78f7abc-4b68-42d0-a613-5a5e48a7a1a0
INFISICAL_TOKEN=st.f3edd743-dda8-47cc-9105-085b2a138ffb.ffa2f242889e400fd58034ba1befcb86.8ea7e7ce51ae0c9b12e8aeb3d15b440a
INFISICAL_ENV=prod

infisical run --projectId=$INFISICAL_PROJECT_ID --env=$INFISICAL_ENV --domain=$INFISICAL_DOMAIN -- printenv | grep SECRET
