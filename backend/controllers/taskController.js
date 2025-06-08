const prisma = require('../lib/prisma');


const getTaskByDate = async (req, res) => {
    const { date } = req.params;

    try {
        const tasks = await prisma.challenges.findMany({
            where: {
                date: new Date(date),
            },
        });

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this date' });
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateAttemptsTask = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedTask = await prisma.challenges.update({
            where: { id: parseInt(id) },
            data: { attempts: { increment: 1 } },
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task attempts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateSolvedTask = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedTask = await prisma.challenges.update({
            where: { id: parseInt(id) },
            data: { solved_by: { increment: 1 } },
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task attempts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getTaskByDate,
    updateAttemptsTask,
    updateSolvedTask,
};