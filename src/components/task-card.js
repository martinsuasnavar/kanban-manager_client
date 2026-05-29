
// components/task-card.jsx

"use client";

import { useState } from "react";

import { serverUrl } from "@/global-variables";

import { callApi } from "./call-api";

export default function TaskCard({
  task_id,
  task_content,
  permission_type,
}) {
  const [taskContent, setTaskContent] =
    useState(task_content);

  const [isEditing, setIsEditing] =
    useState(false);

  // =========================
  // UPDATE TASK
  // =========================

  const updateTaskContent = async () => {
    if (permission_type !== "write") {
      window.alert("Solo tiene permisos de lectura");
      return;
    }

    try {
      await callApi(
        `${serverUrl}/tasks/${task_id}/update-content`,
        "PUT",
        {
          content: taskContent,
        }
      );

      setIsEditing(false);

      console.log(
        "Contenido de tarea actualizado"
      );
    } catch (error) {
      console.error(
        "Error actualizando tarea:",
        error
      );
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta tarea?"
      )
    ) {
      return;
    }

    try {
      await callApi(
        `${serverUrl}/delete-task/${task_id}`,
        "DELETE"
      );

      // quick refresh
      window.location.reload();
    } catch (error) {
      console.error(
        "Error eliminando tarea:",
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
        w-60
        min-h-[70px]
        rounded-xl
        bg-gray-200
        hover:bg-gray-100
        text-black
        p-3
        shadow-sm
        transition-all
        duration-150
        cursor-grab
        active:cursor-grabbing
        select-none
      "
      onClick={() => {
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
    >
      {isEditing ? (
        <div className="flex flex-col gap-2">

          <textarea
            value={taskContent}
            onChange={(e) =>
              setTaskContent(e.target.value)
            }
            className="
              w-full
              min-h-[80px]
              bg-white
              rounded
              p-2
              outline-none
              resize-none
              border
              border-gray-300
            "
            autoFocus
          />

          <div className="flex justify-between gap-2">

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTask();
              }}
              className="
                flex-1
                bg-red-500
                hover:bg-red-600
                text-white
                text-sm
                py-2
                rounded
                cursor-pointer
              "
            >
              Eliminar
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                updateTaskContent();
              }}
              className="
                flex-1
                bg-blue-500
                hover:bg-blue-600
                text-white
                text-sm
                py-2
                rounded
                cursor-pointer
              "
            >
              Guardar
            </button>

          </div>
        </div>
      ) : (
        <p
          className="
            whitespace-pre-wrap
            break-words
            text-sm
          "
        >
          {taskContent || "[Tarea vacía]"}
        </p>
      )}
    </div>
  );
}

