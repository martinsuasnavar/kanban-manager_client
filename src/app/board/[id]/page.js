// app/boards/[id]/page.jsx

"use client";

import Button from "@/components/button";
import BoardColumn from "@/components/board-column";
import { useEffect, useState } from "react";
import { serverUrl } from "@/global-variables";
import { callApi } from "@/components/call-api";
import { useParams, useRouter } from "next/navigation";
import { loggedUserId } from "@/global-variables";
import RedButton from "@/components/red-button";

import {
  DragDropContext,
} from "@hello-pangea/dnd";

export default function SelectedBoard() {
  const { id } = useParams();
  const router = useRouter();

  const [columns, setColumns] = useState([]);
  const [boardEnvironment, setBoardEnvironment] = useState(null);
  const [boardName, setBoardName] = useState("");
  const [parentProject, setParentProject] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [permissionType, setPermissionType] = useState("write");

  const navigateTo = (path) => router.push("/" + path);

  // =========================
  // FETCH BOARD
  // =========================

  const fetchBoard = async () => {
    try {
      const response = await fetch(`${serverUrl}/boards/${id}`);
      const data = await response.json();
      const board = Array.isArray(data) ? data[0] : data;

      setBoardEnvironment(board);

      if (!isEditingName) {
        setBoardName(board?.name || "[nombre de tablero no encontrado]");
      }
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  };

  // =========================
  // FETCH PROJECT
  // =========================

  const fetchParentProject = async () => {
    try {
      const response = await fetch(
        `${serverUrl}/get-project/${boardEnvironment?.linked_project_id}`
      );
      const data = await response.json();
      const project = Array.isArray(data) ? data[0] : data;

      setParentProject(project);
    } catch (error) {
      console.error("Error fetching parent project:", error);
    }
  };

  // =========================
  // FETCH PERMISSIONS
  // =========================

  const fetchBoardPermission = async () => {
    try {
      const response = await fetch(
        `${serverUrl}/get-permission-board/${id}/${loggedUserId.value}`
      );
      const data = await response.json();
      const permission = Array.isArray(data) ? data[0] : data;

      if (permission?.type === "read") setPermissionType("read");
      if (permission?.type === "write") setPermissionType("write");

      if (loggedUserId.value == parentProject?.associated_user_id) {
        setPermissionType("write");
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  // =========================
  // FETCH COLUMNS + TASKS
  // =========================

  const fetchColumns = async () => {
    try {
      const response = await fetch(`${serverUrl}/boards/${id}/columns`);
      const columnsData = await response.json();

      const columnsWithTasks = await Promise.all(
        columnsData.map(async (column) => {
          const taskResponse = await fetch(
            `${serverUrl}/columns/${column.column_id}/tasks`
          );
          const tasks = await taskResponse.json();

          const seenTaskIds = new Set();
          const uniqueTasks = tasks.filter((task) => {
            if (seenTaskIds.has(task.task_id)) return false;
            seenTaskIds.add(task.task_id);
            return true;
          });

          return {
            ...column,
            tasks: uniqueTasks,
          };
        })
      );

      // Force state assignment using array layout spread
      setColumns([...columnsWithTasks]);
    } catch (error) {
      console.error("Couldn't fetch columns:", error);
    }
  };

  // =========================
  // DRAG END
  // =========================

  const onDragEnd = async (result) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumnIndex = columns.findIndex(
      (col) => col.column_id.toString() === source.droppableId
    );

    const destinationColumnIndex = columns.findIndex(
      (col) => col.column_id.toString() === destination.droppableId
    );

    const sourceColumn = columns[sourceColumnIndex];
    const destinationColumn = columns[destinationColumnIndex];

    const sourceTasks = [...sourceColumn.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    // MISMA COLUMNA
    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);

      const updatedColumns = [...columns];
      updatedColumns[sourceColumnIndex] = {
        ...sourceColumn,
        tasks: sourceTasks,
      };

      setColumns(updatedColumns);
    } else {
      // DIFERENTE COLUMNA
      const destinationTasks = [...destinationColumn.tasks];
      destinationTasks.splice(destination.index, 0, movedTask);

      const updatedColumns = [...columns];
      updatedColumns[sourceColumnIndex] = {
        ...sourceColumn,
        tasks: sourceTasks,
      };

      updatedColumns[destinationColumnIndex] = {
        ...destinationColumn,
        tasks: destinationTasks,
      };

      setColumns(updatedColumns);

      try {
        await callApi(
          `${serverUrl}/tasks/${movedTask.task_id}/move`,
          "PUT",
          { linked_column_id: destinationColumn.column_id }
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  // =========================
  // CREATE COLUMN
  // =========================

  const createColumn = async () => {
    if (permissionType !== "write") {
      window.alert("Solo tiene permisos de lectura");
      return;
    }

    try {
      // 1. Send the normalized key-value object to your corrected callApi script
      const res = await callApi(
        `${serverUrl}/create-column`,
        "POST",
        { id }
      );

      // 2. 🛡️ VERIFY RESPONSE: Only run updates when backend affirms creation
      if (res && (res.status === 201 || res.ok)) {
        console.log("Column verified on database layer. Refreshing visual board layout...");
        await fetchColumns(); // Instant execution update
      } else {
        console.error("Backend write operation failed to append column container mapping.");
      }
    } catch (error) {
      console.error("Error creating column:", error);
    }
  };

  // =========================
  // UPDATE BOARD NAME
  // =========================

  const updateBoardName = async () => {
    if (permissionType !== "write") {
      window.alert("Solo tiene permisos de lectura");
      return;
    }

    try {
      await callApi(`${serverUrl}/boards/${id}/update-name`, "PUT", {
        name: boardName,
      });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating board name:", error);
    }
  };

  // =========================
  // DELETE BOARD
  // =========================

  const deleteBoard = async () => {
    if (permissionType !== "write") {
      alert("No tienes permisos para eliminar este tablero.");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este tablero?")) return;

    try {
      await callApi(`${serverUrl}/delete-board/${id}`, "DELETE");
      navigateTo("boards");
    } catch (error) {
      console.error("Error eliminando tablero:", error);
      alert("Hubo un error al intentar eliminar el tablero.");
    }
  };

  // =========================================
  // PIPELINE EFFECTS (Safe Event Synchronization)
  // =========================================

  // 1. Run exactly once on initial workspace access mount
  useEffect(() => {
    fetchBoard();
    fetchColumns();
  }, [id]);

  // 2. Fires exactly once when board payload context resolves safely from null
  useEffect(() => {
    if (boardEnvironment?.linked_project_id) {
      fetchParentProject();
    }
    fetchBoard();
    fetchColumns();
  }, [boardEnvironment]);

  // 3. Fires exactly once when parent data maps onto state
  useEffect(() => {
    if (parentProject) {
      fetchBoardPermission();
    }
  }, [parentProject]);

  // =========================
  // RENDER
  // =========================

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <>
        <div className="fixed inset-0 -z-10 bg-[url('/bgboard.png')] bg-no-repeat bg-cover bg-center" />
        <main className="font-sans min-h-screen p-8 overflow-auto w-screen">
          <div className="project-container w-max min-w-full">
            
            <div className="flex items-center gap-3 mb-10">
              {isEditingName ? (
                <>
                  <RedButton onClick={deleteBoard}>Eliminar</RedButton>
                  <input
                    type="text"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="text-5xl font-bold border-b border-gray-400 outline-none bg-transparent"
                  />
                  <Button onClick={updateBoardName}>Guardar</Button>
                </>
              ) : (
                <h1
                  className="text-5xl font-bold cursor-pointer"
                  onClick={() => setIsEditingName(true)}
                >
                  {boardName}
                </h1>
              )}
            </div>

            <div className="flex gap-14 items-start">
              {columns.map((column) => (
                <BoardColumn
                  key={column.column_id}
                  linked_column_id={column.column_id}
                  permission_type={permissionType}
                  tasks={column.tasks}
                  column_name={column.name}
                />
              ))}

              {permissionType === "write" && (
                <button
                  onClick={createColumn}
                  className="mt-4 flex-none w-55 h-30 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-dashed border-white/30 hover:border-white/50 rounded-xl text-white font-medium transition-all duration-200 cursor-pointer"
                >
                  <span className="text-2xl">+</span>
                  <span>Añadir columna</span>
                </button>
              )}
            </div>

          </div>
        </main>
      </>
    </DragDropContext>
  );
}