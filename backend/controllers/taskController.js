const prisma = require('../lib/prisma');


const getTaskByDate = async (req, res) => {
    const { date } = req.params;
    
    try {
        let tasks = await prisma.challenges.findMany({
            where: {
                solving_date: {
                    gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                    lt: new Date(new Date(date).setHours(23, 59, 59, 999))
                },
            },
            include: {
                test_cases: true 
            },
        });
        
        if (tasks.length === 0) {
            tasks = await prisma.challenges.findMany({
                where: {
                    expired: false
                },
                orderBy: {
                    solving_date: 'desc'
                },
                take: 1,
                include: {
                    test_cases: true // Include test cases data
                },
            });
        }

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this date' });
        }

        const safeSerialize = (data) => {
            return JSON.parse(JSON.stringify(data, (key, value) => {
                if (value instanceof Date) {
                    return value.toISOString();
                }
                if (typeof value === 'bigint') {
                    return value.toString();
                }
                return value;
            }));
        };
        
        const processedTasks = tasks.map(task => {
            const safeTask = safeSerialize(task);
            
            if (safeTask.test_cases) {
                safeTask.test_cases = safeTask.test_cases.map(testCase => ({
                    id: testCase.id,
                    input: testCase.input || '',
                    output: testCase.output || '',
                    post_id: testCase.post_id
                }));
            }
            
            return safeTask;
        });
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(processedTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

const updateAttemptsTask = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if id is a UUID (string) or numeric
        const where = {};
        if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            where.id = id;
        } else {
            try {
                where.id = parseInt(id);
            } catch (e) {
                where.id = id; // If parsing fails, use as is
            }
        }

        const updatedTask = await prisma.challenges.update({
            where: where,
            data: { 
                attempted_by: { increment: 1 } 
            },
        });

        // Convert BigInt to string for JSON response
        const result = { ...updatedTask };
        if (typeof result.attempted_by === 'bigint') {
            result.attempted_by = result.attempted_by.toString();
        }
        if (typeof result.solved_by === 'bigint') {
            result.solved_by = result.solved_by.toString();
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating task attempts:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const updateSolvedTask = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if id is a UUID (string) or numeric
        const where = {};
        if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            where.id = id;
        } else {
            try {
                where.id = parseInt(id);
            } catch (e) {
                where.id = id; // If parsing fails, use as is
            }
        }

        const updatedTask = await prisma.challenges.update({
            where: where,
            data: { 
                solved_by: { increment: 1 } 
            },
        });

        // Convert BigInt to string for JSON response
        const result = { ...updatedTask };
        if (typeof result.attempted_by === 'bigint') {
            result.attempted_by = result.attempted_by.toString();
        }
        if (typeof result.solved_by === 'bigint') {
            result.solved_by = result.solved_by.toString();
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating task solved count:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

module.exports = {
    getTaskByDate,
    updateAttemptsTask,
    updateSolvedTask,
};