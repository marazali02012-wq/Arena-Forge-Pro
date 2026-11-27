'use strict';

function createClientVersionGate(env = process.env) {
  const raw = env.AFP_MIN_ONLINE_VERSION_CODE ?? '0';
  const minimum = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(minimum) || minimum > 2100000000) {
    throw new Error('Invalid AFP_MIN_ONLINE_VERSION_CODE');
  }

  function admitClient(socket, frame) {
    if (minimum === 0) return true;
    const version = frame?.clientVersionCode;
    if (Number.isSafeInteger(version) && version >= minimum && version <= 2100000000) {
      return true;
    }

    socket.send(JSON.stringify({
      type: 'server_error',
      protocolVersion: 1,
      code: 'client_update_required',
      minimumClientVersionCode: minimum,
      message: 'Çevrim içi savaş için Arena Forge Pro güncellemesi gerekli.'
    }));
    socket.close(4406, 'client_update_required');
    return false;
  }
  return Object.assign(admitClient, { minimum });
}

module.exports = { createClientVersionGate };
