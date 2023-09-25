/* Royale Dependency List: */
/**
 * Generated by Apache Royale Compiler from /home/joshua/Development/Haxe/openfl/lib/openfl/events/EventDispatcher.as
 * openfl.events.EventDispatcher
 *
 * @fileoverview
 * @externs
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

/** @const */
var openfl = {};
/** @const */
openfl.events = {};

/**
 * Aggregates an instance of the EventDispatcher class.
 *
 * The EventDispatcher class is generally used as a base class, which
 * means that most developers do not need to use this constructor function.
 * However, advanced developers who are implementing the IEventDispatcher
 * interface need to use this constructor. If you are unable to extend the
 * EventDispatcher class and must instead implement the IEventDispatcher
 * interface, use this constructor to aggregate an instance of the
 * EventDispatcher class.
 * 
 * @asparam target The target object for events dispatched to the
 *               EventDispatcher object. This parameter is used when the
 *               EventDispatcher instance is aggregated by a class that
 *               implements IEventDispatcher; it is necessary so that the
 *               containing object can be the target for events. Do not use
 *               this parameter in simple cases in which a class extends
 *               EventDispatcher.
 * @constructor
 * @implements {openfl.events.IEventDispatcher}
 * @param {openfl.events.IEventDispatcher=} target
 */
openfl.events.EventDispatcher = function(target) {
};


/**
 * Registers an event listener object with an EventDispatcher object so that
 * the listener receives notification of an event. You can register event
 * listeners on all nodes in the display list for a specific type of event,
 * phase, and priority.
 *
 * After you successfully register an event listener, you cannot change
 * its priority through additional calls to `addEventListener()`.
 * To change a listener's priority, you must first call
 * `removeListener()`. Then you can register the listener again
 * with the new priority level. 
 *
 * Keep in mind that after the listener is registered, subsequent calls to
 * `addEventListener()` with a different `type` or
 * `useCapture` value result in the creation of a separate
 * listener registration. For example, if you first register a listener with
 * `useCapture` set to `true`, it listens only during
 * the capture phase. If you call `addEventListener()` again using
 * the same listener object, but with `useCapture` set to
 * `false`, you have two separate listeners: one that listens
 * during the capture phase and another that listens during the target and
 * bubbling phases. 
 *
 * You cannot register an event listener for only the target phase or the
 * bubbling phase. Those phases are coupled during registration because
 * bubbling applies only to the ancestors of the target node.
 *
 * If you no longer need an event listener, remove it by calling
 * `removeEventListener()`, or memory problems could result. Event
 * listeners are not automatically removed from memory because the garbage
 * collector does not remove the listener as long as the dispatching object
 * exists(unless the `useWeakReference` parameter is set to
 * `true`).
 *
 * Copying an EventDispatcher instance does not copy the event listeners
 * attached to it.(If your newly created node needs an event listener, you
 * must attach the listener after creating the node.) However, if you move an
 * EventDispatcher instance, the event listeners attached to it move along
 * with it.
 *
 * If the event listener is being registered on a node while an event is
 * being processed on this node, the event listener is not triggered during
 * the current phase but can be triggered during a later phase in the event
 * flow, such as the bubbling phase.
 *
 * If an event listener is removed from a node while an event is being
 * processed on the node, it is still triggered by the current actions. After
 * it is removed, the event listener is never invoked again(unless
 * registered again for future processing). 
 * 
 * @asparam type             The type of event.
 * @asparam useCapture       Determines whether the listener works in the
 *                         capture phase or the target and bubbling phases.
 *                         If `useCapture` is set to
 *                         `true`, the listener processes the
 *                         event only during the capture phase and not in the
 *                         target or bubbling phase. If
 *                         `useCapture` is `false`, the
 *                         listener processes the event only during the
 *                         target or bubbling phase. To listen for the event
 *                         in all three phases, call
 *                         `addEventListener` twice, once with
 *                         `useCapture` set to `true`,
 *                         then again with `useCapture` set to
 *                         `false`.
 * @asparam priority         The priority level of the event listener. The
 *                         priority is designated by a signed 32-bit integer.
 *                         The higher the number, the higher the priority.
 *                         All listeners with priority _n_ are processed
 *                         before listeners of priority _n_-1. If two or
 *                         more listeners share the same priority, they are
 *                         processed in the order in which they were added.
 *                         The default priority is 0.
 * @asparam useWeakReference Determines whether the reference to the listener
 *                         is strong or weak. A strong reference(the
 *                         default) prevents your listener from being
 *                         garbage-collected. A weak reference does not.
 *
 *                         Class-level member functions are not subject to
 *                         garbage collection, so you can set
 *                         `useWeakReference` to `true`
 *                         for class-level member functions without
 *                         subjecting them to garbage collection. If you set
 *                         `useWeakReference` to `true`
 *                         for a listener that is a nested inner function,
 *                         the function will be garbage-collected and no
 *                         longer persistent. If you create references to the
 *                         inner function(save it in another variable) then
 *                         it is not garbage-collected and stays
 *                         persistent.
 * @throws ArgumentError The `listener` specified is not a
 *                       function.
 * @export
 * @param {string} type
 * @param {Function} listener
 * @param {boolean=} useCapture
 * @param {number=} priority
 * @param {boolean=} useWeakReference
 */
openfl.events.EventDispatcher.prototype.addEventListener = function(type, listener, useCapture, priority, useWeakReference) {
};


/**
 * Dispatches an event into the event flow. The event target is the
 * EventDispatcher object upon which the `dispatchEvent()` method
 * is called.
 * 
 * @asparam event The Event object that is dispatched into the event flow. If
 *              the event is being redispatched, a clone of the event is
 *              created automatically. After an event is dispatched, its
 *              `target` property cannot be changed, so you must
 *              create a new copy of the event for redispatching to work.
 * @asreturn A value of `true` if the event was successfully
 *         dispatched. A value of `false` indicates failure or
 *         that `preventDefault()` was called on the event.
 * @throws Error The event dispatch recursion limit has been reached.
 * @export
 * @param {openfl.events.Event} event
 * @return {boolean}
 */
openfl.events.EventDispatcher.prototype.dispatchEvent = function(event) {
  return false;
};


/**
 * Checks whether the EventDispatcher object has any listeners registered for
 * a specific type of event. This allows you to determine where an
 * EventDispatcher object has altered handling of an event type in the event
 * flow hierarchy. To determine whether a specific event type actually
 * triggers an event listener, use `willTrigger()`.
 *
 * The difference between `hasEventListener()` and
 * `willTrigger()` is that `hasEventListener()`
 * examines only the object to which it belongs, whereas
 * `willTrigger()` examines the entire event flow for the event
 * specified by the `type` parameter. 
 *
 * When `hasEventListener()` is called from a LoaderInfo
 * object, only the listeners that the caller can access are considered.
 * 
 * @asparam type The type of event.
 * @asreturn A value of `true` if a listener of the specified type
 *         is registered; `false` otherwise.
 * @export
 * @param {string} type
 * @return {boolean}
 */
openfl.events.EventDispatcher.prototype.hasEventListener = function(type) {
  return false;
};


/**
 * Removes a listener from the EventDispatcher object. If there is no
 * matching listener registered with the EventDispatcher object, a call to
 * this method has no effect.
 * 
 * @asparam type       The type of event.
 * @asparam useCapture Specifies whether the listener was registered for the
 *                   capture phase or the target and bubbling phases. If the
 *                   listener was registered for both the capture phase and
 *                   the target and bubbling phases, two calls to
 *                   `removeEventListener()` are required to
 *                   remove both, one call with `useCapture()` set
 *                   to `true`, and another call with
 *                   `useCapture()` set to `false`.
 * @export
 * @param {string} type
 * @param {Function} listener
 * @param {boolean=} useCapture
 */
openfl.events.EventDispatcher.prototype.removeEventListener = function(type, listener, useCapture) {
};


/**
 * @export
 * @return {string}
 */
openfl.events.EventDispatcher.prototype.toString = function() {
  return null;
};


/**
 * Checks whether an event listener is registered with this EventDispatcher
 * object or any of its ancestors for the specified event type. This method
 * returns `true` if an event listener is triggered during any
 * phase of the event flow when an event of the specified type is dispatched
 * to this EventDispatcher object or any of its descendants.
 *
 * The difference between the `hasEventListener()` and the
 * `willTrigger()` methods is that `hasEventListener()`
 * examines only the object to which it belongs, whereas the
 * `willTrigger()` method examines the entire event flow for the
 * event specified by the `type` parameter. 
 *
 * When `willTrigger()` is called from a LoaderInfo object,
 * only the listeners that the caller can access are considered.
 * 
 * @asparam type The type of event.
 * @asreturn A value of `true` if a listener of the specified type
 *         will be triggered; `false` otherwise.
 * @export
 * @param {string} type
 * @return {boolean}
 */
openfl.events.EventDispatcher.prototype.willTrigger = function(type) {
  return false;
};
