#!/bin/bash
echo "<<!! Log Out of Steam !!>>\r\n"
echo WHAT IS THY PASSWORD?

read password

"$STEAM_CONTENT_BUILDER\\builder\\steamcmd.exe" +login pykedout $password +run_app_build_http "$STEAM_CONTENT_BUILDER\\scripts\\app_goblin_life.vdf" +quit
