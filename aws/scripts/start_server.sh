#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Parameters to be set before pushing the deployment to Github.
USER=ubuntu
VERSION_SUFFIX=4
LAUNCH_ENV=production
APP_DIR=auto_farm_metrics
SHOULD_START_SERVER=false

# Path is defined in appspec.yml
INITIAL_PUSH_LOCATION=/home/$USER/applications/$APP_DIR
COMPOSITES_DIR=all-composites
COMPOSITES_ENV_DIR=/home/$USER/applications/$COMPOSITES_DIR/$LAUNCH_ENV/$APP_DIR/$VERSION_SUFFIX
CONFIG_LOCATION=/home/$USER/applications/configs/$APP_DIR/.env.$LAUNCH_ENV.local

# Move initially uploaded content to destination folder.
mkdir -p $COMPOSITES_ENV_DIR
cp -r $INITIAL_PUSH_LOCATION/. $COMPOSITES_ENV_DIR/.

# Copy environment specific config into directory.
cp $CONFIG_LOCATION $COMPOSITES_ENV_DIR


# Move to the composite's directory and run the composite.
if [ "$SHOULD_START_SERVER" = true ] ; then
    cd $COMPOSITES_ENV_DIR
    npm install
    npm run deploy:$LAUNCH_ENV
fi
