// components/board-column.jsx

"use client";

import { useState } from "react";

import { serverUrl } from "@/global-variables";

import { callApi } from "./call-api";

import CreateButton from "./create-button";

import TaskCard from "./task-card";

import {
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function BoardColumn({
  linked_column_id,
  permission_type,
  tasks,
  column_name: initialColumnName,
}) {
  const [columnName, setColumnName] = useState(
    initialColumnName
  );

  const [isEditingName, setIsEditingName] =
    useState(false);

  // =========================
  // CREATE TASK
  // =========================

  const createTask = async () => {
    if (permission_type !== "write") {
      window.alert("Solo tiene permisos de lectura");
      return;
    }

    try {
      await callApi(
        `${serverUrl}/create-task`,
        "POST",
        {
          linked_column_id,
        }
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Error creando tarea:",
        error
      );
    }
  };

  // =========================
  // UPDATE COLUMN NAME
  // =========================

  const updateColumnName = async () => {
    if (permission_type !== "write") {
      window.alert("Solo tiene permisos de lectura");
      return;
    }

    if (columnName === "") {
      window.alert("Nombre de columna vacío");
      return;
    }

    try {
      await callApi(
        `${serverUrl}/columns/${linked_column_id}/update-name`,
        "PUT",
        {
          name: columnName,
        }
      );

      setIsEditingName(false);
    } catch (error) {
      console.error(
        "Error actualizando nombre:",
        error
      );
    }
  };

  // =========================
  // DELETE COLUMN
  // =========================

  const deleteColumn = async () => {
    if (permission_type !== "write") {
      window.alert("Solo tiene permisos de lectura");
      return;
    }

    const confirmDelete = confirm(
      `ATENCIÓN: Esta por eliminar la columna "${columnName}"`
    );

    if (!confirmDelete) return;

    try {
      await callApi(
        `${serverUrl}/columns/${linked_column_id}`,
        "DELETE"
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Error eliminando columna:",
        error
      );
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div
      className="
        min-w-[280px]
       w-[280px]
        h-fit
        rounded-xl
        bg-white/70
        text-black
        flex
        flex-col
        items-center
        justify-start
        p-4
        shadow-md
      "
    >
      {/* HEADER */}

      <div className="mb-4 w-full text-center">

        {isEditingName ? (
          <>
            <input
              type="text"
              value={columnName}
              onChange={(e) =>
                setColumnName(e.target.value)
              }
              className="
                text-lg
                font-semibold
                border-b
                border-gray-400
                outline-none
                bg-transparent
                text-center
                w-full
              "
            />

            <button
              onClick={updateColumnName}
              className="
                mt-1
                text-sm
                text-blue-600
                hover:underline
                cursor-pointer
              "
            >
              Guardar
            </button>
          </>
        ) : (
          <div className="flex justify-between items-center">

            <h2
              className="
                text-xl
                font-semibold
                cursor-pointer
              "
              onClick={() =>
                setIsEditingName(true)
              }
            >
              {columnName}
            </h2>

            <button
              onClick={deleteColumn}
              className="
                text-red-500
                hover:text-red-700
                text-lg
                font-bold
                cursor-pointer
              "
              title="Eliminar columna"
            >
              ×
            </button>

          </div>
        )}

      </div>

      {/* TASKS */}

      <Droppable
        droppableId={linked_column_id.toString()}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="
           mb-4
            w-full
            min-h-[100px]
            flex
            flex-col
          "
          >

            {tasks.map((task, index) => (
       <Draggable
          key={task.task_id}
          draggableId={task.task_id.toString()}
          index={index}
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="mb-3"
            >
              <TaskCard
                task_id={task.task_id}
                task_content={task.content}
                permission_type={permission_type}
              />
            </div>
          )}
        </Draggable>
            ))}

            {provided.placeholder}

          </div>
        )}
      </Droppable>

      {/* CREATE TASK */}

      <CreateButton onClick={createTask} />

    </div>
  );
}

