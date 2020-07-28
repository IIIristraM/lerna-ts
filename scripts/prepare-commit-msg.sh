if [ -z "${CI}" ]; then
    echo "creating commit...";
    exec < /dev/tty && git cz --hook || true;
else
    exit 0;
fi