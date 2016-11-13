#!/bin/bash

echo "unblocking bluetooth"
/bin/kill -9 `ps | grep "rfcomm connect" | head -n1 | awk '{print $1}'`
/bin/sleep 1
/usr/sbin/rfkill unblock bluetooth 
/usr/bin/killall bluetoothd
/bin/sleep 1
/usr/bin/hciconfig hci0 up

/home/root/bluez/bluez-5.42/tools/btmgmt unpair -t 0 00:15:83:35:60:2C
/home/root/bluez/bluez-5.42/tools/btmgmt power off
/bin/sleep 1
/home/root/bluez/bluez-5.42/tools/btmgmt power on
/bin/sleep 1
/home/root/bluez/bluez-5.42/tools/btmgmt pair -t 0 00:15:83:35:60:2C < /home/root/bt/pin
/bin/sleep 1
/usr/bin/rfcomm connect rfcomm0 00:15:83:35:60:2C &
