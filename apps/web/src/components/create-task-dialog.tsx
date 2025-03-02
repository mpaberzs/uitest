import * as React from 'react';
import Box from '@mui/material/Box';
import type { CreateTask } from '@todoiti/common';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  TextareaAutosize,
  TextField,
} from '@mui/material';
import { useNotifications } from '@toolpad/core/useNotifications';
import type { DialogComponent, DialogProps } from '@toolpad/core/useDialogs';
import z from 'zod';
import { createTask } from 'src/lib/api/tasksApi';

const CreateTaskDialog: DialogComponent<any, any> = ({
  open,
  onClose,
  payload,
}: DialogProps<{ taskListName: string; taskListId: string }, { created: boolean }>) => {
  const notifications = useNotifications();
  const [nameError, setNameError] = React.useState<string>('');
  const [newTaskPayload, setNewTaskPayload] = React.useState<Omit<CreateTask, 'task_list_id'>>({
    name: '',
    description: '',
    status: 'active',
  });
  const handleSubmit = React.useCallback(
    async (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      setNameError('');
      let newTaskName = '';
      try {
        newTaskName = z.string().min(3).parse(newTaskPayload.name);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setNameError(error.issues[0]?.message ?? '');
        } else {
          console.error(error);
        }
        return;
      }

      try {
        await createTask(payload.taskListId, {
          name: newTaskName,
          description: newTaskPayload.description,
          status: 'active',
        });
        notifications.show(`Task "${newTaskName}" created successfully`, {
          severity: 'success',
          autoHideDuration: 10_000,
        });
        setNewTaskPayload({ name: '', description: '', status: 'active' });

        onClose({ created: true });
      } catch (error: any) {
        notifications.show(
          `Error creating task "${newTaskName}": ${error?.response?.data?.message || error?.message}`,
          {
            severity: 'error',
            autoHideDuration: 10_000,
          }
        );
      }
    },
    [createTask, onClose, newTaskPayload, nameError, payload]
  );

  const { taskListName } = payload;
  return (
    <Dialog fullWidth open={open} onClose={() => onClose({ created: false })}>
      <DialogTitle>Create new subtask in "{taskListName}"</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="name">Task name</FormLabel>
            <TextField
              error={Boolean(nameError)}
              helperText={nameError}
              id="name"
              type="text"
              name="name"
              placeholder="Task name"
              fullWidth
              color={nameError ? 'error' : 'primary'}
              onChange={(event) =>
                setNewTaskPayload({ ...newTaskPayload, name: event.target.value })
              }
              value={newTaskPayload.name}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="description">Task description</FormLabel>
            <TextareaAutosize
              name="description"
              placeholder="Task description"
              id="description"
              color="primary"
              onChange={(event) =>
                setNewTaskPayload({ ...newTaskPayload, description: event.target.value })
              }
              value={newTaskPayload.description}
              minRows={5}
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={handleSubmit}>
          Save
        </Button>
        <Button color="error" onClick={() => onClose({ created: false })}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog;
