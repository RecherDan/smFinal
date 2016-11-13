#!/bin/bash
ifconfig | awk '/wlan0/{getline; print}' | cut -d: -f2 | cut -d' ' -f1
