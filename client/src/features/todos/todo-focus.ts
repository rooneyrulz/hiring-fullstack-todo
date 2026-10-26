export const NEW_TODO_ID_PREFIX = "todo";

export function focusNewTodoField() {
    document.getElementById(`${NEW_TODO_ID_PREFIX}-title`)?.focus();
}
