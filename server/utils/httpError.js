// Creates an error whose message is safe to show to the client.
// Optional errorCode (e.g. "PLAN_LIMIT") lets the client react to specific cases.
module.exports = (status, message, errorCode) => Object.assign(new Error(message), { status, expose: true, errorCode });
